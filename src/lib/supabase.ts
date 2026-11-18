import { createClient } from '@supabase/supabase-js';

function findEnvValue(directNames: string[], suffixNames: string[]): string {
    for (const name of directNames) {
        const v = process.env[name]?.trim();
        if (
            v &&
            !v.includes('dummy-project') &&
            !v.includes('REPLACE_WITH') &&
            v !== 'dummy'
        ) {
            return v;
        }
    }
    for (const [key, val] of Object.entries(process.env)) {
        if (
            suffixNames.some((s) => key.endsWith(s)) &&
            val &&
            !val.includes('dummy-project') &&
            !val.includes('REPLACE_WITH')
        ) {
            return val.trim();
        }
    }
    return '';
}

function getSupabaseUrl(): string {
    return findEnvValue(
        ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'],
        ['_SUPABASE_URL']
    );
}

function getSupabaseAnonKey(): string {
    return findEnvValue(
        [
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_ANON_KEY',
            'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
            'SUPABASE_PUBLISHABLE_KEY',
        ],
        ['_SUPABASE_ANON_KEY', '_SUPABASE_PUBLISHABLE_KEY']
    );
}

function getSupabaseServiceRoleKey(): string {
    return findEnvValue(
        ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'],
        ['_SUPABASE_SERVICE_ROLE_KEY', '_SUPABASE_SECRET_KEY']
    );
}

export function isSupabaseConfigured(): boolean {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey();
    return Boolean(url && key);
}

export function isStripeConfigured(): boolean {
    const key = process.env.STRIPE_SECRET_KEY || '';
    return (
        Boolean(key) &&
        key.startsWith('sk_') &&
        !key.includes('dummy') &&
        !key.includes('REPLACE_WITH')
    );
}

export function isMercadoPagoConfigured(): boolean {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    return (
        Boolean(token) &&
        !token.includes('dummy') &&
        !token.includes('REPLACE_WITH')
    );
}

const resolvedUrl = getSupabaseUrl();
const resolvedAnon = getSupabaseAnonKey();

export const supabase =
    resolvedUrl && resolvedAnon
        ? createClient(resolvedUrl, resolvedAnon)
        : (null as any);

export function getSupabaseAdmin() {
    const url = getSupabaseUrl();
    const serviceRoleKey = getSupabaseServiceRoleKey();

    if (!url || !serviceRoleKey) {
        return null as any;
    }

    return createClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    password_hash: string;
                    role: 'student' | 'parent' | 'admin';
                    is_premium: boolean;
                    premium_expires_at: string | null;
                    student_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['users']['Insert']>;
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    product_id: string;
                    product_name: string;
                    amount: number;
                    currency: string;
                    status: 'pending' | 'completed' | 'failed' | 'refunded';
                    payment_provider: 'stripe' | 'mercadopago';
                    provider_payment_id: string | null;
                    provider_customer_id: string | null;
                    metadata: any;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
            };
            subscriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    product_id: string;
                    status: 'active' | 'canceled' | 'past_due' | 'trialing';
                    payment_provider: 'stripe' | 'mercadopago';
                    provider_subscription_id: string;
                    current_period_start: string;
                    current_period_end: string;
                    cancel_at_period_end: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
            };
            module_access: {
                Row: {
                    id: string;
                    user_id: string;
                    module_id: string;
                    access_type: 'free' | 'premium' | 'purchased';
                    granted_by_transaction_id: string | null;
                    expires_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['module_access']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['module_access']['Insert']>;
            };
        };
    };
}
