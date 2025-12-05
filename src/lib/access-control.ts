import { getSupabaseAdmin } from './supabase';

// Check if user has access to a specific module
export async function hasModuleAccess(userId: string, moduleId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('module_access')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();

    if (error || !data) return false;

    // Check if access has expired
    if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
            return false;
        }
    }

    return true;
}

// Get all modules a user has access to
export async function getUserModules(userId: string): Promise<string[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('module_access')
        .select('module_id, expires_at')
        .eq('user_id', userId);

    if (error || !data) return [];

    // Filter out expired access
    const now = new Date();
    return data
        .filter((access: any) => !access.expires_at || new Date(access.expires_at) > now)
        .map((access: any) => access.module_id);
}

// Check if user has active premium subscription
export async function isPremiumUser(userId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
        .from('users')
        .select('is_premium, premium_expires_at')
        .eq('id', userId)
        .single();

    if (error || !user) return false;

    if (!user.is_premium) return false;

    // Check if premium has expired
    if (user.premium_expires_at) {
        const expiresAt = new Date(user.premium_expires_at);
        if (expiresAt < new Date()) {
            // Update user status
            await supabase
                .from('users')
                .update({ is_premium: false })
                .eq('id', userId);
            return false;
        }
    }

    return true;
}

// Get user's transaction history
export async function getUserTransactions(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// Get user's active subscriptions
export async function getUserSubscriptions(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

    if (error) throw error;
    return data;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, provider: 'stripe' | 'mercadopago') {
    const supabase = getSupabaseAdmin();

    // Get subscription details
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

    if (error || !subscription) {
        throw new Error('Subscription not found');
    }

    if (provider === 'stripe') {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        await stripe.subscriptions.update(subscription.provider_subscription_id, {
            cancel_at_period_end: true
        });
    } else {
        // MercadoPago subscription cancellation
        // Note: MercadoPago doesn't have native subscriptions, handle manually
        await supabase
            .from('subscriptions')
            .update({
                status: 'canceled',
                cancel_at_period_end: true
            })
            .eq('id', subscriptionId);
    }

    return { success: true };
}
