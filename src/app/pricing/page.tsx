"use client";

import Link from "next/link";
import { Check, X, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRODUCTS } from "@/lib/payment-service";
import { NEFTALI_CAL_COM_URL, NEFTALI_SESSION } from "@/lib/neftali";

export default function PricingPage() {
    const premiumPlan = PRODUCTS.find((p) => p.id === "premium_monthly");

    if (!premiumPlan) return null;

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] text-xs font-semibold uppercase tracking-wide mb-4">
                        Planes Transparentes
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-brand-900)] mb-4">
                        Invierte en tu Futuro Académico
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                        Elige el plan que mejor se adapte a tus metas y comienza a estudiar con método hoy mismo.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="surface-card p-8 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Plan Básico</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">$0</span>
                                <span className="text-slate-500 text-sm">/mes</span>
                            </div>
                            <p className="text-slate-500 mt-2 text-sm">
                                Ideal para explorar el diagnóstico inicial y organizar tu semana.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-700 text-sm">
                                <Check size={18} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                <span>Diagnóstico académico inicial</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 text-sm">
                                <Check size={18} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                <span>Planificador semanal y Temporizador Pomodoro</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <X size={18} className="flex-shrink-0" />
                                <span>Simuladores EXANI-II con retroalimentación</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <X size={18} className="flex-shrink-0" />
                                <span>Reportes ejecutivos y soporte prioritario</span>
                            </li>
                        </ul>

                        <Link href="/auth/register">
                            <Button variant="outline" className="w-full justify-center">
                                Crear cuenta gratuita
                            </Button>
                        </Link>
                    </div>

                    {/* Premium Plan — tarjeta crema papel, borde verde (SISTEMA-VISUAL.md §5). */}
                    <div className="sketch-card rounded-[12px] p-8 shadow-xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[var(--color-brand-600)] text-white text-xs font-bold px-3.5 py-1 rounded-bl-xl">
                            RECOMENDADO
                        </div>

                        <div className="mb-6 relative z-10">
                            <h2 className="text-xl font-bold text-[var(--color-brand-900)] mb-2 flex items-center gap-2">
                                <Star className="text-[#D9A441] fill-[#D9A441]" size={20} />
                                {premiumPlan.name}
                            </h2>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-bold text-[var(--color-brand-900)]">${premiumPlan.price}</span>
                                <span className="text-[var(--color-text-muted)] text-sm">MXN /mes</span>
                            </div>
                            <p className="text-[var(--color-text-muted)] mt-2 text-sm">
                                La experiencia completa para tu ingreso universitario.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            {premiumPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-[#14532D] text-sm">
                                    <Check size={18} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/checkout?product=${premiumPlan.id}`} className="relative z-10">
                            <Button
                                variant="primary"
                                className="w-full justify-center text-base py-3.5 font-bold shadow-lg"
                            >
                                <Zap size={18} className="mr-2 fill-current" /> Suscribirse Ahora
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Sesión NEFTALÍ: oferta aparte, no es un plan de Conética */}
                <div className="max-w-4xl mx-auto mt-12 sketch-card overflow-hidden">
                    <div className="grid md:grid-cols-12 gap-0 items-stretch">
                        <div className="md:col-span-4">
                            <img
                                src="/images/neftali/balanza.png"
                                alt="Motivo dibujado a mano: una balanza en acuarela, para pesar una decisión"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="md:col-span-8 p-7 sm:p-8 text-center md:text-left">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-600)] mb-2">
                        Consultoría filosófica NEFTALÍ · Pensamiento aplicado a la vida real
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-brand-900)] mb-2">
                        ¿Tu duda no es académica sino de vida?
                    </h2>
                    <p className="text-slate-600 mb-1">
                        {NEFTALI_SESSION.name}: {NEFTALI_SESSION.duration}, {NEFTALI_SESSION.priceLabel} {NEFTALI_SESSION.priceNote.toLowerCase()}. {NEFTALI_SESSION.place}.
                    </p>
                    <p className="text-sm text-slate-600 mb-5">
                        {NEFTALI_SESSION.cancellation}. {NEFTALI_SESSION.referral}. {NEFTALI_SESSION.notTherapy}. {NEFTALI_SESSION.credentials}.
                    </p>
                    <a href={NEFTALI_CAL_COM_URL} target="_blank" rel="noopener noreferrer">
                        <Button size="lg">Agendar mi sesión · $400</Button>
                    </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
