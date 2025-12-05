"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PAYMENT_METHODS, createCheckoutSession, confirmPayment, getProduct } from "@/lib/payment-service";
import { Button } from "@/components/ui/Button";
import { CreditCard, Wallet, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function CheckoutForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('product') || 'premium_monthly';
    const product = getProduct(productId);

    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Producto no encontrado</h2>
                    <Link href="/services" className="text-blue-600 hover:underline mt-2 block">
                        Volver a Servicios
                    </Link>
                </div>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!selectedMethod) return;

        setIsProcessing(true);
        try {
            // 1. Create Session
            const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
            if (!method) throw new Error("Invalid method");

            const session = await createCheckoutSession(method.provider, product.id);

            // 2. Confirm Payment (Simulated)
            const success = await confirmPayment(session.id);

            if (success) {
                router.push('/checkout/success');
            } else {
                alert("El pago falló. Por favor intenta de nuevo.");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error inesperado.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">

                {/* Left Column: Payment Methods */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Método de Pago</h2>

                        <div className="space-y-4">
                            {PAYMENT_METHODS.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedMethod === method.id
                                            ? 'border-[var(--color-brand-500)] bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg ${selectedMethod === method.id ? 'bg-white text-[var(--color-brand-600)]' : 'bg-gray-100 text-gray-500'}`}>
                                        {method.icon === 'credit-card' ? <CreditCard size={24} /> : <Wallet size={24} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{method.name}</div>
                                        <div className="text-sm text-gray-500">Procesado de forma segura</div>
                                    </div>
                                    <div className="ml-auto">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-[var(--color-brand-500)]' : 'border-gray-300'}`}>
                                            {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-[var(--color-brand-500)]" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mock Card Form (Only shows if card is selected) */}
                        {selectedMethod === 'card' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Número de Tarjeta</label>
                                    <div className="relative">
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Expiración</label>
                                        <input type="text" placeholder="MM/AA" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">CVC</label>
                                        <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                        <ShieldCheck size={16} className="text-green-600" />
                        Pagos encriptados y seguros vía SSL de 256-bits.
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Orden</h3>

                        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                            <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">
                                    {product.interval === 'mensual' ? 'Facturación mensual' : 'Pago único'}
                                </div>
                            </div>
                            <div className="font-bold text-gray-900">${product.price}</div>
                        </div>

                        <div className="py-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${product.price}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Impuestos (IVA)</span>
                                <span>$0.00</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-gray-900">Total</span>
                            <span className="font-bold text-2xl text-[var(--color-brand-600)]">
                                ${product.price} <span className="text-sm font-normal text-gray-500">{product.currency}</span>
                            </span>
                        </div>

                        <Button
                            onClick={handlePayment}
                            disabled={!selectedMethod || isProcessing}
                            className="w-full py-4 text-lg"
                            isLoading={isProcessing}
                        >
                            {isProcessing ? 'Procesando...' : 'Confirmar Pago'} <ArrowRight size={20} className="ml-2" />
                        </Button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            Al confirmar, aceptas nuestros términos de servicio.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Cargando checkout...</div>}>
            <CheckoutForm />
        </Suspense>
    );
}
