import { createClient } from '@supabase/supabase-js';

// Supabase client for client-side operations (uses anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only throw error at runtime, not during build
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.warn('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any;

// Supabase admin client for server-side operations (uses service role key)
// This bypasses RLS - use only in API routes and server components
export function getSupabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    if (!serviceRoleKey || !supabaseUrl) {
        // During build time, return a mock client
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Using mock client for build.');
            return null as any;
        }
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. This is required for admin operations.');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Database types (auto-generated from Supabase schema)
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
