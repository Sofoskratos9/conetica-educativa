"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getProduct } from "@/lib/payment-service";
import confetti from "canvas-confetti";

function SuccessContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get("product") || "premium_monthly";
    const isDemo = searchParams.get("demo") === "true";
    const provider = searchParams.get("provider");
    const product = getProduct(productId);

    useEffect(() => {
        const duration = 2200;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 28, spread: 360, ticks: 55, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }
            const particleCount = 40 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 } });
        }, 260);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">¡Confirmación Exitosa!</h1>
                <p className="text-slate-600 mb-6">
                    Has activado{" "}
                    <span className="font-bold text-[var(--color-brand-600)]">
                        {product ? product.name : "Conética Premium"}
                    </span>
                    .
                </p>

                {isDemo && (
                    <div className="mb-6 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2 text-left">
                        <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
                        <span>
                            <strong>Modo Vista Previa ({provider === "mercadopago" ? "Mercado Pago" : "Stripe"}):</strong>{" "}
                            Al configurar tus llaves reales de producción en Vercel, aquí se procesará el cobro real y el webhook activará los permisos en Supabase.
                        </span>
                    </div>
                )}

                <div className="bg-[var(--color-brand-50)] rounded-xl p-6 mb-8 text-left">
                    <h2 className="font-bold text-[var(--color-brand-900)] mb-3 flex items-center gap-2 text-base">
                        <Zap size={18} className="text-amber-500 fill-amber-500" /> Beneficios incluidos:
                    </h2>
                    <ul className="space-y-2 text-sm text-slate-700">
                        {(product?.features || [
                            "Módulos avanzados de estudio",
                            "Simuladores EXANI-II ilimitados",
                            "Orientación vocacional RIASEC",
                        ]).map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[var(--color-brand-500)] rounded-full flex-shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link href="/dashboard">
                    <Button className="w-full py-4 text-base">
                        Ir a mi Dashboard <ArrowRight size={18} className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Confirmando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
