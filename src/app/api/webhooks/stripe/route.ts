import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json(
                { error: 'Webhook signature verification failed' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Log webhook event for debugging
        await supabase.from('webhook_events').insert({
            provider: 'stripe',
            event_type: event.type,
            event_id: event.id,
            payload: event.data.object,
            processed: false
        });

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session, supabase);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentSucceeded(paymentIntent, supabase);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentFailed(paymentIntent, supabase);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription, supabase);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription, supabase);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentSucceeded(invoice, supabase);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Mark webhook as processed
        await supabase
            .from('webhook_events')
            .update({ processed: true })
            .eq('event_id', event.id);

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle successful checkout session
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
    const userId = session.metadata?.userId;
    const productId = session.metadata?.productId;
    const type = session.metadata?.type;

    if (!userId || !productId) {
        console.error('Missing metadata in checkout session');
        return;
    }

    // Update transaction status
    await supabase
        .from('transactions')
        .update({
            status: 'completed',
            provider_payment_id: session.payment_intent as string
        })
        .eq('provider_payment_id', session.id);

    if (type === 'subscription') {
        // Handle subscription - subscription.created event will handle the rest
        console.log('Subscription checkout completed, waiting for subscription.created event');
    } else {
        // Handle one-time purchase - grant immediate access
        await grantModuleAccess(userId, productId, supabase, session.id);
    }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
    // Update transaction status
    await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('provider_payment_id', paymentIntent.id);
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
    await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('provider_payment_id', paymentIntent.id);
}

// Handle subscription creation/update
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
    const customerId = subscription.customer as string;

    // Get user by customer ID
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!user) {
        console.error('User not found for customer:', customerId);
        return;
    }

    // Upsert subscription record
    await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            product_id: 'premium_monthly',
            status: subscription.status,
            payment_provider: 'stripe',
            provider_subscription_id: subscription.id,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
        }, {
            onConflict: 'provider_subscription_id'
        });

    // Update user premium status
    if (subscription.status === 'active' || subscription.status === 'trialing') {
        await supabase
            .from('users')
            .update({
                is_premium: true,
                premium_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString()
            })
            .eq('id', user.id);

        // Grant access to all premium modules
        await grantPremiumAccess(user.id, supabase);
    }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
    const customerId = subscription.customer as string;

    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!user) return;

    // Update subscription status
    await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('provider_subscription_id', subscription.id);

    // Remove premium status
    await supabase
        .from('users')
        .update({
            is_premium: false,
            premium_expires_at: null
        })
        .eq('id', user.id);

    // Remove premium module access
    await supabase
        .from('module_access')
        .delete()
        .eq('user_id', user.id)
        .eq('access_type', 'premium');
}

// Handle successful invoice payment (recurring subscription)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
    if (!(invoice as any).subscription) return;

    const customerId = invoice.customer as string;

    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!user) return;

    // Create transaction record for recurring payment
    await supabase.from('transactions').insert({
        user_id: user.id,
        product_id: 'premium_monthly',
        product_name: 'Conética Premium - Renovación Mensual',
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'completed',
        payment_provider: 'stripe',
        provider_payment_id: (invoice as any).payment_intent as string,
        provider_customer_id: customerId,
        metadata: { invoice_id: invoice.id }
    });
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

// Grant access to all premium modules
async function grantPremiumAccess(userId: string, supabase: any) {
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
            access_type: 'premium'
        }, {
            onConflict: 'user_id,module_id'
        });
    }
}
