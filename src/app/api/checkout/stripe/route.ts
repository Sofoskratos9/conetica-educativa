import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
});

// Validation schema
const CheckoutSchema = z.object({
    productId: z.string(),
    userId: z.string().uuid(),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const { productId, userId, successUrl, cancelUrl } = CheckoutSchema.parse(body);

        const supabase = getSupabaseAdmin();

        // Get user from database
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get product details (from your products catalog)
        const products: Record<string, any> = {
            'premium_monthly': {
                name: 'Conética Premium',
                price: 29900, // $299 MXN in cents
                currency: 'mxn',
                type: 'subscription',
                interval: 'month'
            },
            'mentorship_4_sessions': {
                name: 'Programa de Mentoría (4 Sesiones)',
                price: 199900, // $1,999 MXN
                currency: 'mxn',
                type: 'one_time'
            },
            'single_session': {
                name: 'Sesión Individual',
                price: 59900, // $599 MXN
                currency: 'mxn',
                type: 'one_time'
            },
            'vocational_guidance': {
                name: 'Orientación Vocacional Completa',
                price: 149900, // $1,499 MXN
                currency: 'mxn',
                type: 'one_time'
            },
            'exani_prep': {
                name: 'Preparación EXANI Personalizada',
                price: 249900, // $2,499 MXN
                currency: 'mxn',
                type: 'one_time'
            }
        };

        const product = products[productId];
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Create or retrieve Stripe customer
        let customerId = user.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id,
                    role: user.role
                }
            });
            customerId = customer.id;

            // Save customer ID to database
            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Stripe Checkout Session
        if (product.type === 'subscription') {
            // Create subscription checkout
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: product.currency,
                            product_data: {
                                name: product.name,
                                description: 'Acceso ilimitado a todos los módulos de Conética Educativa™'
                            },
                            recurring: {
                                interval: product.interval
                            },
                            unit_amount: product.price
                        },
                        quantity: 1
                    }
                ],
                success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${baseUrl}/checkout?product=${productId}`,
                metadata: {
                    userId: user.id,
                    productId: productId,
                    type: 'subscription'
                }
            });

            // Create pending transaction record
            await supabase.from('transactions').insert({
                user_id: user.id,
                product_id: productId,
                product_name: product.name,
                amount: product.price / 100,
                currency: product.currency.toUpperCase(),
                status: 'pending',
                payment_provider: 'stripe',
                provider_payment_id: session.id,
                provider_customer_id: customerId,
                metadata: { session_id: session.id }
            });

            return NextResponse.json({ url: session.url });

        } else {
            // Create one-time payment checkout
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: product.currency,
                            product_data: {
                                name: product.name
                            },
                            unit_amount: product.price
                        },
                        quantity: 1
                    }
                ],
                success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${baseUrl}/checkout?product=${productId}`,
                metadata: {
                    userId: user.id,
                    productId: productId,
                    type: 'one_time'
                }
            });

            // Create pending transaction record
            await supabase.from('transactions').insert({
                user_id: user.id,
                product_id: productId,
                product_name: product.name,
                amount: product.price / 100,
                currency: product.currency.toUpperCase(),
                status: 'pending',
                payment_provider: 'stripe',
                provider_payment_id: session.id,
                provider_customer_id: customerId,
                metadata: { session_id: session.id }
            });

            return NextResponse.json({ url: session.url });
        }

    } catch (error) {
        console.error('Stripe checkout error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
