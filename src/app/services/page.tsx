"use client";

import Link from "next/link";
import { PRODUCTS } from "@/lib/payment-service";
import { Check, ArrowRight, Star, Zap, BookOpen, Users, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ServicesPage() {
    const getIcon = (id: string) => {
        switch (id) {
            case 'premium_monthly': return <Star className="text-yellow-400 fill-yellow-400" size={24} />;
            case 'program_4_sessions': return <Users className="text-blue-500" size={24} />;
            case 'single_session': return <Zap className="text-orange-500" size={24} />;
            case 'vocational_pack': return <Compass className="text-purple-500" size={24} />;
            case 'exani_prep': return <BookOpen className="text-emerald-500" size={24} />;
            default: return <Star size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-[var(--color-brand-900)] mb-4">
                        Nuestros Servicios Educativos
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Soluciones personalizadas para cada etapa de tu desarrollo académico.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-white rounded-2xl p-8 border shadow-sm flex flex-col relative ${product.recommended
                                    ? 'border-[var(--color-brand-500)] shadow-lg ring-1 ring-[var(--color-brand-500)]'
                                    : 'border-gray-200'
                                }`}
                        >
                            {product.recommended && (
                                <div className="absolute top-0 right-0 bg-[var(--color-brand-500)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {getIcon(product.id)}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                                    <span className="text-sm text-gray-500">{product.currency}</span>
                                    {product.interval === 'mensual' && <span className="text-sm text-gray-500">/mes</span>}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={`/checkout?product=${product.id}`}>
                                <Button
                                    variant={product.recommended ? 'primary' : 'outline'}
                                    className="w-full justify-center"
                                >
                                    {product.recommended ? 'Suscribirse Ahora' : 'Contratar Servicio'}
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
