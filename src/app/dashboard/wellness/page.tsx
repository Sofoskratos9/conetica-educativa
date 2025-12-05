"use client";

import Link from "next/link";
import { CATEGORIES, STRATEGIES } from "@/lib/wellness-data";
import { ArrowRight, Lightbulb } from "lucide-react";

export default function WellnessDashboardPage() {
    // Simple logic to pick a "daily recommendation" (could be randomized or rotated)
    const dailyRec = STRATEGIES['clarity'][0];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Bienestar Académico</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Herramientas de autorregulación y estrategia para optimizar tu rendimiento.
                    </p>
                </div>
            </div>

            {/* Daily Recommendation Widget */}
            <div className="bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Lightbulb size={24} className="text-yellow-300" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-blue-100 mb-1 uppercase tracking-wider">Estrategia del Día</div>
                        <h3 className="text-xl font-bold mb-2">{dailyRec.title}</h3>
                        <p className="text-blue-100 mb-4 max-w-2xl">
                            {dailyRec.description}
                        </p>
                        <Link href="/dashboard/wellness/clarity" className="inline-flex items-center gap-2 text-sm font-bold hover:underline">
                            Ver técnica completa <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {CATEGORIES.map((cat) => (
                    <Link key={cat.id} href={`/dashboard/wellness/${cat.id}`}>
                        <div className="group bg-white p-6 rounded-xl border border-gray-100 hover:border-[var(--color-brand-200)] hover:shadow-md transition-all h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${cat.bg} ${cat.color}`}>
                                    <cat.icon size={24} />
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-[var(--color-brand-500)] transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-brand-900)] mb-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                                {cat.title}
                            </h3>
                            <p className="text-gray-500 text-sm flex-1">
                                {cat.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
