"use client";

import { useEffect, useState } from "react";
import { Strategy } from "@/lib/wellness-data";
import { Clock, BookOpen, CheckCircle2 } from "lucide-react";

export function StrategyCard({ strategy }: { strategy: Strategy }) {
    const [practiced, setPracticed] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/student/progress")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                const list: string[] = data?.progress?.wellnessCompletedIds || [];
                if (list.includes(strategy.id)) {
                    setPracticed(true);
                }
            })
            .catch(() => {});
    }, [strategy.id]);

    const togglePracticed = async () => {
        if (saving) return;
        const next = !practiced;
        setPracticed(next);
        setSaving(true);
        try {
            const res = await fetch("/api/student/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "complete_wellness",
                    strategyId: strategy.id,
                    strategyTitle: strategy.title,
                    completed: next,
                }),
            });
            if (!res.ok) setPracticed(!next);
        } catch {
            setPracticed(!next);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                    <h3 className="text-xl font-bold text-[var(--color-brand-900)]">{strategy.title}</h3>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            <Clock size={12} /> {strategy.duration}
                        </span>
                        <button
                            type="button"
                            onClick={togglePracticed}
                            disabled={saving}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                                practiced
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-[var(--color-brand-400)]"
                            }`}
                        >
                            <CheckCircle2 size={14} />
                            {practiced ? "Practicada" : "Marcar practicada"}
                        </button>
                    </div>
                </div>
                <p className="text-gray-600 mb-4">{strategy.description}</p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                        <BookOpen size={16} /> Base Científica
                    </div>
                    <p className="text-sm text-blue-700 italic">
                        &ldquo;{strategy.science}&rdquo;
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
