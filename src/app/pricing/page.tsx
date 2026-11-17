"use client";

import Link from "next/link";
import { Check, X, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRODUCTS } from "@/lib/payment-service";

export default function PricingPage() {
    const premiumPlan = PRODUCTS.find((p) => p.id === "premium_monthly");

    if (!premiumPlan) return null;

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-4">
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
                                <Check size={18} className="text-emerald-600 flex-shrink-0" />
                                <span>Diagnóstico psicopedagógico inicial</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 text-sm">
                                <Check size={18} className="text-emerald-600 flex-shrink-0" />
                                <span>Planificador semanal y Temporizador Pomodoro</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <X size={18} className="flex-shrink-0" />
                                <span>Simuladores EXANI-II ilimitados</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <X size={18} className="flex-shrink-0" />
                                <span>Reportes ejecutivos y soporte prioritario</span>
                            </li>
                        </ul>

                        <Link href="/auth/register">
                            <Button variant="outline" className="w-full justify-center">
                                Comenzar Gratis
                            </Button>
                        </Link>
                    </div>

                    {/* Premium Plan */}
                    <div className="gradient-brand rounded-2xl p-8 border border-slate-800 shadow-xl flex flex-col relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-xs font-bold px-3.5 py-1 rounded-bl-xl">
                            RECOMENDADO
                        </div>

                        <div className="mb-6 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Star className="text-amber-400 fill-amber-400" size={20} />
                                {premiumPlan.name}
                            </h2>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-bold text-white">${premiumPlan.price}</span>
                                <span className="text-blue-200 text-sm">MXN /mes</span>
                            </div>
                            <p className="text-blue-100/80 mt-2 text-sm">
                                La experiencia completa sin límites para tu ingreso universitario.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            {premiumPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-100 text-sm">
                                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/checkout?product=${premiumPlan.id}`} className="relative z-10">
                            <Button
                                variant="primary"
                                className="w-full justify-center text-base py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg"
                            >
                                <Zap size={18} className="mr-2 fill-current" /> Suscribirse Ahora
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
