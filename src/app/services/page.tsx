"use client";

import Link from "next/link";
import { PRODUCTS } from "@/lib/payment-service";
import { Check, ArrowRight, Star, Zap, BookOpen, Users, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ServicesPage() {
    const getIcon = (id: string) => {
        switch (id) {
            case "premium_monthly":
                return <Star className="text-amber-500 fill-amber-500" size={24} />;
            case "program_4_sessions":
                return <Users className="text-[var(--color-brand-600)]" size={24} />;
            case "single_session":
                return <Zap className="text-orange-500" size={24} />;
            case "vocational_pack":
                return <Compass className="text-purple-600" size={24} />;
            case "exani_prep":
                return <BookOpen className="text-emerald-600" size={24} />;
            default:
                return <Star size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-xs font-semibold uppercase tracking-wide mb-4">
                        Programas Especializados
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-brand-900)] mb-4">
                        Nuestros Servicios Educativos
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                        Soluciones personalizadas y basadas en evidencia para cada etapa de tu desarrollo académico.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className={`surface-card rounded-2xl overflow-hidden p-8 flex flex-col relative transition-shadow hover:shadow-md ${
                                product.recommended
                                    ? "border-[var(--color-brand-500)] ring-2 ring-[var(--color-brand-500)]/20 shadow-md"
                                    : ""
                            }`}
                        >
                            {product.recommended && (
                                <div className="absolute top-0 right-0 bg-[var(--color-brand-600)] text-white text-xs font-bold px-3.5 py-1 rounded-bl-xl">
                                    MÁS POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                        {getIcon(product.id)}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h2>
                                <p className="text-sm text-slate-500 mb-4">{product.description}</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-bold text-slate-900">
                                        ${product.price.toLocaleString("es-MX")}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">{product.currency}</span>
                                    {product.interval === "mensual" && (
                                        <span className="text-sm text-slate-500">/mes</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={`/checkout?product=${product.id}`}>
                                <Button
                                    variant={product.recommended ? "primary" : "outline"}
                                    className="w-full justify-center"
                                >
                                    {product.recommended ? "Suscribirse Ahora" : "Contratar Servicio"}
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
