import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // MercadoPago sends notifications with different structures
        const { type, data, action } = body;

        const supabase = getSupabaseAdmin();

        // Log webhook event
        await supabase.from('webhook_events').insert({
            provider: 'mercadopago',
            event_type: type || action,
            event_id: data?.id || 'unknown',
            payload: body,
            processed: false
        });

        // Only process payment notifications
        if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data?.id;

            if (!paymentId) {
                return NextResponse.json({ received: true });
            }

            // Get payment details from MercadoPago
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            const userId = paymentData.metadata?.user_id;
            const productId = paymentData.metadata?.product_id;
            const paymentType = paymentData.metadata?.type;

            if (!userId || !productId) {
                console.error('Missing metadata in payment');
                return NextResponse.json({ received: true });
            }

            // Handle payment status
            switch (paymentData.status) {
                case 'approved': {
                    // Update transaction status
                    await supabase
                        .from('transactions')
                        .update({
                            status: 'completed',
                            provider_payment_id: paymentId.toString(),
                            provider_customer_id: paymentData.payer?.id?.toString()
                        })
                        .eq('provider_payment_id', (paymentData as any).preference_id);

                    // Grant module access
                    if (paymentType === 'one_time') {
                        await grantModuleAccess(userId, productId, supabase, paymentId.toString());
                    } else if (paymentType === 'subscription') {
                        // Handle subscription
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

                    // Remove module access
                    await supabase
                        .from('module_access')
                        .delete()
                        .eq('granted_by_transaction_id', paymentId.toString());
                    break;
                }

                default:
                    console.log(`Unhandled payment status: ${paymentData.status}`);
            }

            // Mark webhook as processed
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

// Grant module access based on product
async function grantModuleAccess(userId: string, productId: string, supabase: any, transactionId: string) {
    const moduleMapping: Record<string, string[]> = {
        'mentorship_4_sessions': ['mentorship'],
        'single_session': ['single_session'],
        'vocational_guidance': ['vocational'],
        'exani_prep': ['exani_prep']
    };

    const modules = moduleMapping[productId] || [];

    for (const moduleId of modules) {
        await supabase.from('module_access').upsert({
            user_id: userId,
            module_id: moduleId,
            access_type: 'purchased',
            granted_by_transaction_id: transactionId
        }, {
            onConflict: 'user_id,module_id'
        });
    }
}

// Handle subscription (for premium monthly)
async function handleSubscription(userId: string, paymentData: any, supabase: any) {
    // Update user premium status
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabase
        .from('users')
        .update({
            is_premium: true,
            premium_expires_at: expiresAt.toISOString()
        })
        .eq('id', userId);

    // Grant access to all premium modules
    const premiumModules = [
        'diagnostic',
        'study_plan',
        'exani_prep',
        'vocational',
        'wellness',
        'digital_strategies'
    ];

    for (const moduleId of premiumModules) {
        await supabase.from('module_access').upsert({
            user_id: userId,
            module_id: moduleId,
            access_type: 'premium',
            expires_at: expiresAt.toISOString()
        }, {
            onConflict: 'user_id,module_id'
        });
    }

    // Create subscription record
    await supabase.from('subscriptions').insert({
        user_id: userId,
        product_id: 'premium_monthly',
        status: 'active',
        payment_provider: 'mercadopago',
        provider_subscription_id: paymentData.id.toString(),
        current_period_start: new Date().toISOString(),
        current_period_end: expiresAt.toISOString(),
        cancel_at_period_end: false
    });
}
