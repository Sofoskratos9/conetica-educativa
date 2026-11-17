export type PaymentProvider = 'stripe' | 'mercadopago';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: 'MXN';
    interval: 'mensual' | 'único';
    type: 'subscription' | 'one_time';
    features: string[];
    modulesGranted: string[];
    recommended?: boolean;
}

export const PRODUCTS: Product[] = [
    {
        id: 'premium_monthly',
        name: 'Conética Premium',
        description: 'Acceso completo e ilimitado a todos los módulos, simuladores EXANI-II y orientación vocacional.',
        price: 299,
        currency: 'MXN',
        interval: 'mensual',
        type: 'subscription',
        features: [
            'Acceso total a los 6 módulos educativos',
            'Simuladores EXANI-II ilimitados con retroalimentación',
            'Plan de estudio adaptativo con técnica Pomodoro',
            'Test vocacional RIASEC completo y reporte detallado',
            'Soporte prioritario por WhatsApp'
        ],
        modulesGranted: [
            'diagnostic',
            'study_plan',
            'exani_prep',
            'vocational',
            'wellness',
            'digital_strategies'
        ],
        recommended: true
    },
    {
        id: 'program_4_sessions',
        name: 'Programa de Mentoría (4 Sesiones)',
        description: 'Acompañamiento personalizado 1:1 durante un mes para consolidar hábitos y estrategia.',
        price: 1800,
        currency: 'MXN',
        interval: 'único',
        type: 'one_time',
        features: [
            '4 sesiones 1:1 de 60 minutos en vivo',
            'Plan de acción personalizado basado en diagnóstico',
            'Seguimiento semanal por WhatsApp',
            'Acceso incluido a módulos base por 30 días'
        ],
        modulesGranted: ['mentorship', 'diagnostic', 'study_plan']
    },
    {
        id: 'single_session',
        name: 'Sesión Individual 1:1',
        description: 'Sesión intensiva para resolver dudas específicas, ajustar estrategia o revisar resultados.',
        price: 500,
        currency: 'MXN',
        interval: 'único',
        type: 'one_time',
        features: [
            '1 sesión de 60 minutos con especialista',
            'Resolución de dudas estratégicas o temáticas',
            'Resumen escrito con siguientes pasos'
        ],
        modulesGranted: ['single_session']
    },
    {
        id: 'vocational_pack',
        name: 'Orientación Vocacional Completa',
        description: 'Evaluación psicométrica educativa RIASEC con sesión de interpretación profesional.',
        price: 850,
        currency: 'MXN',
        interval: 'único',
        type: 'one_time',
        features: [
            'Test RIASEC profundo y análisis de aptitudes',
            'Sesión de interpretación 1:1 (90 min)',
            'Reporte de compatibilidad con carreras UAA y nacionales'
        ],
        modulesGranted: ['vocational']
    },
    {
        id: 'exani_prep',
        name: 'Preparación EXANI-II Personalizada',
        description: 'Programa integral enfocado en maximizar tu puntaje de admisión universitaria.',
        price: 2500,
        currency: 'MXN',
        interval: 'único',
        type: 'one_time',
        features: [
            'Diagnóstico inicial estilo CENEVAL EXANI-II',
            '5 sesiones de estrategia cognitiva y resolución',
            'Banco de reactivos comentado y simulacros cronometrados'
        ],
        modulesGranted: ['exani_prep', 'diagnostic', 'study_plan']
    }
];

const PRODUCT_ALIASES: Record<string, string> = {
    mentorship_4_sessions: 'program_4_sessions',
    vocational_guidance: 'vocational_pack',
};

export function getProduct(id: string): Product | undefined {
    const normalizedId = PRODUCT_ALIASES[id] || id;
    return PRODUCTS.find((p) => p.id === normalizedId);
}
