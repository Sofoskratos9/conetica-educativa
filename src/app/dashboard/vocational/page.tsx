"use client";

import Link from "next/link";
import { Compass, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function VocationalIntroPage() {
    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-[var(--color-brand-100)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-brand-600)]">
                    <Compass size={40} />
                </div>
                <h1 className="text-4xl font-bold text-[var(--color-brand-900)] mb-4">
                    Descubre tu Camino Profesional
                </h1>
                <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
                    Utilizamos el modelo científico RIASEC para identificar tus intereses y habilidades, y conectarlos con las carreras ideales para ti.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                    { title: "Autoconocimiento", desc: "Entiende tus fortalezas y preferencias reales." },
                    { title: "Evidencia Científica", desc: "Basado en la teoría de tipos de personalidad de Holland." },
                    { title: "Futuro Claro", desc: "Recibe sugerencias concretas de carreras y áreas de estudio." }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                        <CheckCircle className="w-10 h-10 text-[var(--color-brand-500)] mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                <Link href="/dashboard/vocational/test">
                    <Button size="lg" className="px-12 py-6 text-xl">
                        Comenzar Test Vocacional <ArrowRight className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
