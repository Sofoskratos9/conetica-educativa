"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Zap, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getProduct } from "@/lib/payment-service";
import confetti from "canvas-confetti";

type VerifyState = "idle" | "checking" | "paid" | "pending" | "failed";

function SuccessContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get("product") || "premium_monthly";
    const isDemo = searchParams.get("demo") === "true";
    const provider = searchParams.get("provider");
    const sessionId = searchParams.get("session_id");
    const product = getProduct(productId);

    const [verifyState, setVerifyState] = useState<VerifyState>(
        sessionId && !isDemo && provider !== "mercadopago" ? "checking" : "idle"
    );

    useEffect(() => {
        if (!sessionId || isDemo || provider === "mercadopago") return;
        let cancelled = false;
        fetch(`/api/checkout/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (cancelled) return;
                if (data?.paid) {
                    setVerifyState("paid");
                } else if (data?.status === "open") {
                    setVerifyState("pending");
                } else {
                    setVerifyState("failed");
                }
            })
            .catch(() => {
                if (!cancelled) setVerifyState("pending");
            });
        return () => {
            cancelled = true;
        };
    }, [sessionId, isDemo, provider]);

    useEffect(() => {
        if (verifyState === "failed" || verifyState === "checking") return;
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
    }, [verifyState]);

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] flex items-center justify-center p-4">
            <div className="bg-[#FBF8F1] max-w-lg w-full rounded-2xl p-8 border-2 border-[#14532D] shadow-xl text-center">
                <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        verifyState === "failed"
                            ? "bg-red-100 text-red-600"
                            : verifyState === "pending" || verifyState === "checking"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                    }`}
                >
                    {verifyState === "failed" ? (
                        <AlertCircle size={40} />
                    ) : verifyState === "pending" || verifyState === "checking" ? (
                        <Clock size={40} />
                    ) : (
                        <CheckCircle size={40} />
                    )}
                </div>

                <h1 className="text-3xl font-bold text-[#14532D] mb-2">
                    {verifyState === "checking"
                        ? "Verificando tu pago..."
                        : verifyState === "pending"
                          ? "Pago en confirmación"
                          : verifyState === "failed"
                            ? "No pudimos confirmar el pago"
                            : "¡Confirmación Exitosa!"}
                </h1>
                <p className="text-slate-600 mb-6">
                    {verifyState === "failed" ? (
                        <>No se reflejó un cobro completado para esta sesión. Si ya hiciste el cargo, espera unos segundos o escríbenos por WhatsApp.</>
                    ) : verifyState === "pending" ? (
                        <>Tu sesión de pago sigue procesándose. En cuanto Stripe confirme el cobro, tu acceso quedará activo automáticamente.</>
                    ) : (
                        <>
                            Has activado{" "}
                            <span className="font-bold text-[var(--color-brand-600)]">
                                {product ? product.name : "Conética Premium"}
                            </span>
                            .
                        </>
                    )}
                </p>

                {isDemo && (
                    <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 text-left">
                        <ShieldCheck size={18} className="text-amber-700 flex-shrink-0" />
                        <span>
                            <strong>Modo Vista Previa ({provider === "mercadopago" ? "Mercado Pago" : "Stripe"}):</strong>{" "}
                            Al configurar tus llaves reales de producción en Vercel, aquí se procesará el cobro real y el webhook activará los permisos en Postgres.
                        </span>
                    </div>
                )}

                <div className="bg-[var(--color-brand-50)] rounded-xl p-6 mb-8 text-left border border-[#14532D]/15">
                    <h2 className="font-bold text-[var(--color-brand-900)] mb-3 flex items-center gap-2 text-base">
                        <Zap size={18} className="text-amber-500 fill-amber-500" /> Beneficios incluidos:
                    </h2>
                    <ul className="space-y-2 text-sm text-slate-700">
                        {(product?.features || [
                            "Módulos avanzados de estudio",
                            "Simuladores EXANI-II con retroalimentación",
                            "Orientación vocacional RIASEC",
                        ]).map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[var(--color-brand-500)] rounded-full flex-shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link href={verifyState === "failed" ? "/pricing" : "/dashboard"}>
                    <Button className="w-full py-4 text-base">
                        {verifyState === "failed" ? "Volver a Planes" : "Ir a mi Dashboard"}{" "}
                        <ArrowRight size={18} className="ml-2" />
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

