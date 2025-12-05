"use client";

import Link from "next/link";
import { Check, X, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRODUCTS } from "@/lib/payment-service";

export default function PricingPage() {
    const premiumPlan = PRODUCTS.find(p => p.id === 'premium_monthly');

    if (!premiumPlan) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-[var(--color-brand-900)] mb-4">
                        Invierte en tu Futuro Académico
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Elige el plan que mejor se adapte a tus necesidades y comienza a transformar tu aprendizaje hoy mismo.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Básico</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-900">$0</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <p className="text-gray-500 mt-2">Para estudiantes que quieren explorar.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-gray-600">
                                <Check size={20} className="text-green-500" />
                                <span>Diagnóstico inicial básico</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <Check size={20} className="text-green-500" />
                                <span>Acceso limitado a módulos</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X size={20} />
                                <span>Sin recomendaciones IA</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X size={20} />
                                <span>Sin soporte prioritario</span>
                            </li>
                        </ul>

                        <Link href="/auth/register">
                            <Button variant="outline" className="w-full justify-center">
                                Comenzar Gratis
                            </Button>
                        </Link>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[var(--color-brand-500)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            RECOMENDADO
                        </div>

                        <div className="mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                {premiumPlan.name}
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">${premiumPlan.price}</span>
                                <span className="text-gray-400">/mes</span>
                            </div>
                            <p className="text-gray-400 mt-2">La experiencia completa sin límites.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            {premiumPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300">
                                    <Check size={20} className="text-[var(--color-brand-400)]" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/checkout?product=${premiumPlan.id}`}>
                            <Button variant="primary" className="w-full justify-center text-lg py-6 shadow-[0_0_20px_rgba(var(--color-brand-500-rgb),0.3)]">
                                <Zap size={20} className="mr-2 fill-current" /> Suscribirse Ahora
                            </Button>
                        </Link>

                        {/* Background Decoration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-brand-500)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
