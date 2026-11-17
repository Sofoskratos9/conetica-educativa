import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getSupabaseAdmin, isStripeConfigured, isSupabaseConfigured } from '@/lib/supabase';
import { getProduct } from '@/lib/products';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

const CheckoutSchema = z.object({
    productId: z.string().min(1),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        const session = await verifySessionToken(token);

        if (!session) {
            return NextResponse.json(
                { error: 'Debes iniciar sesión para realizar un pago.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, successUrl, cancelUrl } = CheckoutSchema.parse(body);

        const product = getProduct(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        const origin = request.nextUrl.origin;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
            ? process.env.NEXT_PUBLIC_APP_URL
            : origin;

        // If Stripe or Supabase are not configured with real credentials, run safe preview checkout
        if (!isStripeConfigured() || !isSupabaseConfigured()) {
            return NextResponse.json({
                url: `${baseUrl}/checkout/success?demo=true&provider=stripe&product=${encodeURIComponent(product.id)}`,
                demo: true,
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16',
        });

        const supabase = getSupabaseAdmin();
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id,
                    role: user.role,
                },
            });
            customerId = customer.id;

            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        const unitAmountCents = Math.round(product.price * 100);
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: product.type === 'subscription' ? 'subscription' : 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: product.currency.toLowerCase(),
                        product_data: {
                            name: product.name,
                            description: product.description,
                        },
                        ...(product.type === 'subscription'
                            ? { recurring: { interval: 'month' } }
                            : {}),
                        unit_amount: unitAmountCents,
                    },
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${encodeURIComponent(product.id)}`,
            cancel_url: cancelUrl || `${baseUrl}/checkout?product=${encodeURIComponent(product.id)}`,
            metadata: {
                userId: user.id,
                productId: product.id,
                type: product.type,
            },
        });

        await supabase.from('transactions').insert({
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            amount: product.price,
            currency: product.currency,
            status: 'pending',
            payment_provider: 'stripe',
            provider_payment_id: checkoutSession.id,
            provider_customer_id: customerId,
            metadata: { session_id: checkoutSession.id },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de solicitud inválidos', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'No se pudo iniciar la sesión de pago con Stripe' },
            { status: 500 }
        );
    }
}
