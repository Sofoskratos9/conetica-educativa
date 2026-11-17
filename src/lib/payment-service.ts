export { PRODUCTS, getProduct } from './products';
export type { Product, PaymentProvider } from './products';

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    provider: 'stripe' | 'mercadopago';
    icon: 'credit-card' | 'wallet';
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'card',
        name: 'Tarjeta de Crédito o Débito (Stripe)',
        description: 'Visa, Mastercard, American Express • Pago cifrado 256-bit',
        provider: 'stripe',
        icon: 'credit-card'
    },
    {
        id: 'mercadopago',
        name: 'Mercado Pago',
        description: 'Saldo, transferencia SPEI, OXXO y tarjetas locales en México',
        provider: 'mercadopago',
        icon: 'wallet'
    }
];
