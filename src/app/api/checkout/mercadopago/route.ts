import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { z } from 'zod';
import { getSupabaseAdmin, isMercadoPagoConfigured, isSupabaseConfigured } from '@/lib/supabase';
import { getProduct } from '@/lib/products';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

const CheckoutSchema = z.object({
    productId: z.string().min(1),
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
        const { productId } = CheckoutSchema.parse(body);

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

        if (!isMercadoPagoConfigured() || !isSupabaseConfigured()) {
            return NextResponse.json({
                url: `${baseUrl}/checkout/success?demo=true&provider=mercadopago&product=${encodeURIComponent(product.id)}`,
                demo: true,
            });
        }

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

        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
        });
        const preference = new Preference(client);

        const preferenceData = await preference.create({
            body: {
                items: [
                    {
                        id: product.id,
                        title: product.name,
                        description: product.description,
                        quantity: 1,
                        unit_price: product.price,
                        currency_id: product.currency,
                    },
                ],
                payer: {
                    email: user.email,
                    name: user.name,
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success?product=${encodeURIComponent(product.id)}`,
                    failure: `${baseUrl}/checkout?product=${encodeURIComponent(product.id)}&error=payment_failed`,
                    pending: `${baseUrl}/checkout?product=${encodeURIComponent(product.id)}&status=pending`,
                },
                auto_return: 'approved',
                notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                metadata: {
                    user_id: user.id,
                    product_id: product.id,
                    type: product.type,
                },
            },
        });

        await supabase.from('transactions').insert({
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            amount: product.price,
            currency: product.currency,
            status: 'pending',
            payment_provider: 'mercadopago',
            provider_payment_id: preferenceData.id,
            metadata: { preference_id: preferenceData.id },
        });

        return NextResponse.json({
            url: preferenceData.init_point,
            preferenceId: preferenceData.id,
        });
    } catch (error) {
        console.error('MercadoPago checkout error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de solicitud inválidos', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'No se pudo iniciar la sesión de pago con Mercado Pago' },
            { status: 500 }
        );
    }
}
