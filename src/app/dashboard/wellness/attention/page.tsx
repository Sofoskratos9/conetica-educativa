"use client";

import Link from "next/link";
import { ArrowLeft, Focus } from "lucide-react";
import { STRATEGIES } from "@/lib/wellness-data";
import { StrategyCard } from "@/components/wellness/StrategyCard";

export default function AttentionPage() {
    const strategies = STRATEGIES['attention'];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/dashboard/wellness" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Volver a Bienestar
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Focus size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Estrategias de Atención</h1>
                        <p className="text-gray-500">Ejercicios para entrenar el enfoque sostenido.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {strategies.map(strategy => (
                    <StrategyCard key={strategy.id} strategy={strategy} />
                ))}
            </div>
        </div>
    );
}
