"use client";

import { Strategy } from "@/lib/wellness-data";
import { Clock, BookOpen } from "lucide-react";

export function StrategyCard({ strategy }: { strategy: Strategy }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[var(--color-brand-900)]">{strategy.title}</h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <Clock size={12} /> {strategy.duration}
                    </span>
                </div>
                <p className="text-gray-600 mb-4">{strategy.description}</p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                        <BookOpen size={16} /> Base Científica
                    </div>
                    <p className="text-sm text-blue-700 italic">
                        "{strategy.science}"
                    </p>
                </div>
            </div>

            <div className="p-6 bg-gray-50">
                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Pasos a seguir</h4>
                <ol className="space-y-3">
                    {strategy.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-brand-200)] text-[var(--color-brand-700)] flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                            </span>
                            <span className="mt-0.5">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
