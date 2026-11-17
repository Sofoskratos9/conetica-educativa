import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSupabaseAdmin, isMercadoPagoConfigured, isSupabaseConfigured } from '@/lib/supabase';
import { getProduct } from '@/lib/products';

export async function POST(request: NextRequest) {
    try {
        if (!isMercadoPagoConfigured() || !isSupabaseConfigured()) {
            return NextResponse.json(
                { error: 'MercadoPago webhook not configured in this environment' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { type, data, action } = body;

        const supabase = getSupabaseAdmin();

        await supabase.from('webhook_events').insert({
            provider: 'mercadopago',
            event_type: type || action || 'unknown',
            event_id: data?.id?.toString() || `mp_${Date.now()}`,
            payload: body,
            processed: false,
        });

        if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data?.id;
            if (!paymentId) {
                return NextResponse.json({ received: true });
            }

            const client = new MercadoPagoConfig({
                accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
            });
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            const userId = paymentData.metadata?.user_id;
            const productId = paymentData.metadata?.product_id;
            const paymentType = paymentData.metadata?.type;

            if (!userId || !productId) {
                return NextResponse.json({ received: true });
            }

            switch (paymentData.status) {
                case 'approved': {
                    await supabase
                        .from('transactions')
                        .update({
                            status: 'completed',
                            provider_payment_id: paymentId.toString(),
                            provider_customer_id: paymentData.payer?.id?.toString(),
                        })
                        .eq('provider_payment_id', (paymentData as any).preference_id);

                    if (paymentType === 'one_time') {
                        await grantModuleAccess(userId, productId, supabase, paymentId.toString());
                    } else if (paymentType === 'subscription') {
                        await handleSubscription(userId, paymentData, supabase);
                    }
                    break;
                }
                case 'rejected':
                case 'cancelled': {
                    await supabase
                        .from('transactions')
                        .update({ status: 'failed' })
                        .eq('provider_payment_id', (paymentData as any).preference_id);
                    break;
                }
                case 'refunded': {
                    await supabase
                        .from('transactions')
                        .update({ status: 'refunded' })
                        .eq('provider_payment_id', paymentId.toString());

                    await supabase
                        .from('module_access')
                        .delete()
                        .eq('granted_by_transaction_id', paymentId.toString());
                    break;
                }
            }

            await supabase
                .from('webhook_events')
                .update({ processed: true })
                .eq('event_id', paymentId.toString());
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('MercadoPago webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function grantModuleAccess(userId: string, productId: string, supabase: any, transactionId: string) {
    const product = getProduct(productId);
    const modules = product?.modulesGranted || [];

    for (const moduleId of modules) {
        await supabase.from('module_access').upsert(
            {
                user_id: userId,
                module_id: moduleId,
                access_type: 'purchased',
                granted_by_transaction_id: transactionId,
            },
            { onConflict: 'user_id,module_id' }
        );
    }
}

async function handleSubscription(userId: string, paymentData: any, supabase: any) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabase
        .from('users')
        .update({
            is_premium: true,
            premium_expires_at: expiresAt.toISOString(),
        })
        .eq('id', userId);

    const product = getProduct('premium_monthly');
    const premiumModules = product?.modulesGranted || [];

    for (const moduleId of premiumModules) {
        await supabase.from('module_access').upsert(
            {
                user_id: userId,
                module_id: moduleId,
                access_type: 'premium',
                expires_at: expiresAt.toISOString(),
            },
            { onConflict: 'user_id,module_id' }
        );
    }

    await supabase.from('subscriptions').insert({
        user_id: userId,
        product_id: 'premium_monthly',
        status: 'active',
        payment_provider: 'mercadopago',
        provider_subscription_id: paymentData.id.toString(),
        current_period_start: new Date().toISOString(),
        current_period_end: expiresAt.toISOString(),
        cancel_at_period_end: false,
    });
}
