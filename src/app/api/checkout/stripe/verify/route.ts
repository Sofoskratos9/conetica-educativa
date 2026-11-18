import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Verifica una sesión de Stripe Checkout: la página de éxito NO debe
// afirmar que el pago fue exitoso sin comprobarlo. El acceso real se
// concede por webhook, pero esta ruta permite a la página de éxito
// mostrar el estado correcto (pagado / pendiente / fallido).
export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
    }

    try {
        const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json({
            status: session.status,
            paymentStatus: session.payment_status,
            paid: session.payment_status === 'paid',
            productId: session.metadata?.productId ?? null
        });
    } catch (error) {
        console.error('Stripe verify error:', error);
        return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
    }
}
