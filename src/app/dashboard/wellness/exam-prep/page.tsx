"use client";

import Link from "next/link";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { STRATEGIES } from "@/lib/wellness-data";
import { StrategyCard } from "@/components/wellness/StrategyCard";

export default function ExamPrepPage() {
    const strategies = STRATEGIES['exam-prep'];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/dashboard/wellness" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Volver a Bienestar
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <CheckSquare size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Estructura Pre-Examen</h1>
                        <p className="text-gray-500">Protocolos para optimizar tu rendimiento el día de la prueba.</p>
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
