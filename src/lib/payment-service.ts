export type PaymentProvider = 'stripe' | 'mercadopago';

export interface PaymentMethod {
    id: string;
    name: string;
    provider: PaymentProvider;
    icon: string; // URL or icon name
}

export interface CheckoutSession {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    provider: PaymentProvider;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'card',
        name: 'Tarjeta de Crédito/Débito',
        provider: 'stripe',
        icon: 'credit-card'
    },
    {
        id: 'mercadopago',
        name: 'Mercado Pago',
        provider: 'mercadopago',
        icon: 'wallet'
    }
];

export interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval?: 'mensual' | 'único';
    features: string[];
    recommended?: boolean;
}

export const PRODUCTS: Product[] = [
    {
        id: 'premium_monthly',
        name: 'Conética Premium',
        price: 299,
        currency: 'MXN',
        interval: 'mensual',
        features: [
            'Acceso total a módulos',
            'Simuladores ilimitados',
            'Soporte 24/7'
        ],
        recommended: true
    },
    {
        id: 'program_4_sessions',
        name: 'Programa de Mentoría (4 Sesiones)',
        price: 1800,
        currency: 'MXN',
        interval: 'único',
        features: [
            '4 sesiones 1:1 de 60 min',
            'Plan de acción personalizado',
            'Seguimiento semanal por WhatsApp'
        ]
    },
    {
        id: 'single_session',
        name: 'Sesión Individual',
        price: 500,
        currency: 'MXN',
        interval: 'único',
        features: [
            '1 sesión de 60 min',
            'Resolución de dudas específicas',
            'Diagnóstico rápido'
        ]
    },
    {
        id: 'vocational_pack',
        name: 'Orientación Vocacional Completa',
        price: 850,
        currency: 'MXN',
        interval: 'único',
        features: [
            'Test RIASEC Profundo',
            'Sesión de interpretación (90 min)',
            'Reporte PDF detallado'
        ]
    },
    {
        id: 'exani_prep',
        name: 'Preparación EXANI Personalizada',
        price: 2500,
        currency: 'MXN',
        interval: 'único',
        features: [
            'Diagnóstico EXANI-II',
            '5 sesiones de estrategia',
            'Banco de reactivos premium'
        ]
    }
];

export function getProduct(id: string): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
}

// Mock function to simulate creating a checkout session
export async function createCheckoutSession(provider: PaymentProvider, productId: string): Promise<CheckoutSession> {
    const product = getProduct(productId);
    if (!product) throw new Error("Product not found");

    // In a real app, this would call the backend API to initialize Stripe/MP
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: `sess_${Math.random().toString(36).substr(2, 9)}`,
                amount: product.price,
                currency: product.currency,
                status: 'pending',
                provider
            });
        }, 1000);
    });
}

// Mock function to confirm payment
export async function confirmPayment(sessionId: string): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate 90% success rate
            resolve(Math.random() > 0.1);
        }, 1500);
    });
}
