"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PAYMENT_METHODS, getProduct } from "@/lib/payment-service";
import { getCurrentUser, fetchServerSession, type User } from "@/lib/auth-service";
import { Button } from "@/components/ui/Button";
import {
    CreditCard,
    Wallet,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Lock,
} from "lucide-react";
import Link from "next/link";

function CheckoutForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("product") || "premium_monthly";
    const errorParam = searchParams.get("error");
    const product = getProduct(productId);

    const [selectedMethod, setSelectedMethod] = useState<string>("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        errorParam === "payment_failed" ? "El pago no pudo completarse. Intenta de nuevo." : ""
    );
    const [user, setUser] = useState<User | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function loadUser() {
            const local = getCurrentUser();
            const serverUser = await fetchServerSession();
            if (!mounted) return;
            setUser(serverUser || local);
            setCheckingSession(false);
        }
        loadUser();
        return () => {
            mounted = false;
        };
    }, []);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="surface-card rounded-2xl p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold text-slate-900">Producto no encontrado</h2>
                    <p className="text-sm text-slate-600 mt-2 mb-6">
                        El plan o servicio seleccionado no está disponible.
                    </p>
                    <Link href="/services">
                        <Button>Volver a Servicios</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!selectedMethod) return;
        setErrorMessage("");

        if (!user) {
            router.push(`/auth/login?redirect=${encodeURIComponent(`/checkout?product=${product.id}`)}`);
            return;
        }

        const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
        if (!method) return;

        setIsProcessing(true);
        try {
            const endpoint =
                method.provider === "stripe"
                    ? "/api/checkout/stripe"
                    : "/api/checkout/mercadopago";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id }),
            });

            const data = await res.json();

            if (res.status === 401) {
                router.push(`/auth/login?redirect=${encodeURIComponent(`/checkout?product=${product.id}`)}`);
                return;
            }

            if (!res.ok || !data.url) {
                setErrorMessage(data.error || "No se pudo iniciar el proceso de pago.");
                setIsProcessing(false);
                return;
            }

            window.location.href = data.url;
        } catch {
            setErrorMessage("Error de red al conectar con la pasarela de pago.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ArrowLeft size={16} /> Volver a Servicios
                </Link>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="surface-card p-8 rounded-2xl">
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Finalizar Contratación</h1>
                            <p className="text-sm text-slate-600 mb-6">
                                Selecciona tu pasarela de pago preferida. Serás redirigido de forma segura para completar la transacción.
                            </p>

                            {errorMessage && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-red-700">{errorMessage}</p>
                                </div>
                            )}

                            {!checkingSession && !user && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <Lock className="text-amber-700 flex-shrink-0 mt-0.5" size={18} />
                                        <div className="text-sm text-amber-900">
                                            <strong>Inicia sesión primero</strong> para vincular tu compra directamente a tu cuenta.
                                        </div>
                                    </div>
                                    <Link
                                        href={`/auth/login?redirect=${encodeURIComponent(`/checkout?product=${product.id}`)}`}
                                    >
                                        <Button size="sm">Entrar</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-4">
                                {PAYMENT_METHODS.map((method) => {
                                    const active = selectedMethod === method.id;
                                    return (
                                        <button
                                            type="button"
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                                                active
                                                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <div
                                                className={`p-3 rounded-xl ${
                                                    active
                                                        ? "bg-white text-[var(--color-brand-600)] shadow-sm"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {method.icon === "credit-card" ? (
                                                    <CreditCard size={24} />
                                                ) : (
                                                    <Wallet size={24} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-900">{method.name}</div>
                                                <div className="text-sm text-slate-600">{method.description}</div>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    active ? "border-[var(--color-brand-500)]" : "border-slate-300"
                                                }`}
                                            >
                                                {active && (
                                                    <div className="w-3 h-3 rounded-full bg-[var(--color-brand-500)]" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500 justify-center">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            Nunca almacenamos los números de tu tarjeta. Procesamiento seguro vía Stripe / Mercado Pago.
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div>
                        <div className="surface-card p-6 rounded-2xl sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Resumen de Orden</h2>

                            <div className="pb-4 border-b border-slate-100">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <div className="font-bold text-slate-900">{product.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {product.interval === "mensual" ? "Facturación mensual" : "Pago único"}
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-900">${product.price}</div>
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {product.features.slice(0, 3).map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                            <CheckCircle size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="py-4 space-y-2">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span>${product.price} {product.currency}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Impuestos incluidos</span>
                                    <span>$0.00</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center mb-6">
                                <span className="font-bold text-lg text-slate-900">Total</span>
                                <span className="font-extrabold text-2xl text-[var(--color-brand-600)]">
                                    ${product.price}{" "}
                                    <span className="text-xs font-medium text-slate-500">{product.currency}</span>
                                </span>
                            </div>

                            <Button
                                onClick={handlePayment}
                                disabled={!selectedMethod || isProcessing || checkingSession}
                                className="w-full py-4 text-base"
                                isLoading={isProcessing}
                            >
                                {isProcessing
                                    ? "Conectando..."
                                    : user
                                        ? "Continuar al Pago"
                                        : "Iniciar Sesión para Pagar"}
                                <ArrowRight size={18} className="ml-2" />
                            </Button>

                            <p className="text-xs text-center text-slate-500 mt-4">
                                Al continuar, aceptas nuestros{" "}
                                <Link href="/legal/terms" className="underline">
                                    Términos de Uso
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando checkout...</div>}>
            <CheckoutForm />
        </Suspense>
    );
}
