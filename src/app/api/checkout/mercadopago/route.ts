import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';

// Initialize Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Validation schema
const CheckoutSchema = z.object({
    productId: z.string(),
    userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, userId } = CheckoutSchema.parse(body);

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

        // Product catalog
        const products: Record<string, any> = {
            'premium_monthly': {
                title: 'Conética Premium',
                description: 'Suscripción mensual con acceso ilimitado',
                unit_price: 299,
                currency_id: 'MXN',
                type: 'subscription'
            },
            'mentorship_4_sessions': {
                title: 'Programa de Mentoría (4 Sesiones)',
                description: 'Programa completo de 4 sesiones de mentoría personalizada',
                unit_price: 1999,
                currency_id: 'MXN',
                type: 'one_time'
            },
            'single_session': {
                title: 'Sesión Individual',
                description: 'Una sesión de mentoría personalizada',
                unit_price: 599,
                currency_id: 'MXN',
                type: 'one_time'
            },
            'vocational_guidance': {
                title: 'Orientación Vocacional Completa',
                description: 'Programa completo de orientación vocacional',
                unit_price: 1499,
                currency_id: 'MXN',
                type: 'one_time'
            },
            'exani_prep': {
                title: 'Preparación EXANI Personalizada',
                description: 'Programa completo de preparación para EXANI-II',
                unit_price: 2499,
                currency_id: 'MXN',
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

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create preference
        const preference = new Preference(client);

        const preferenceData = await preference.create({
            body: {
                items: [
                    {
                        id: productId,
                        title: product.title,
                        description: product.description,
                        quantity: 1,
                        unit_price: product.unit_price,
                        currency_id: product.currency_id
                    }
                ],
                payer: {
                    email: user.email,
                    name: user.name
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success`,
                    failure: `${baseUrl}/checkout?product=${productId}&error=payment_failed`,
                    pending: `${baseUrl}/checkout?product=${productId}&status=pending`
                },
                auto_return: 'approved',
                notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                metadata: {
                    user_id: userId,
                    product_id: productId,
                    type: product.type
                }
            }
        });

        // Create pending transaction record
        await supabase.from('transactions').insert({
            user_id: userId,
            product_id: productId,
            product_name: product.title,
            amount: product.unit_price,
            currency: product.currency_id,
            status: 'pending',
            payment_provider: 'mercadopago',
            provider_payment_id: preferenceData.id,
            metadata: { preference_id: preferenceData.id }
        });

        // Return init_point (checkout URL)
        return NextResponse.json({
            url: preferenceData.init_point,
            preferenceId: preferenceData.id
        });

    } catch (error) {
        console.error('MercadoPago checkout error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create checkout' },
            { status: 500 }
        );
    }
}
