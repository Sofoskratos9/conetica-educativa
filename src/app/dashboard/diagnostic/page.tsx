"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, CheckCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
} from "recharts";
import {
    DIAGNOSTIC_QUESTIONS,
    DIAGNOSTIC_AREA_META,
    type DiagnosticArea,
} from "@/lib/diagnostic-data";
import { Button } from "@/components/ui/Button";

interface DiagnosticResult {
    completedAt: string;
    overall: number;
    scores: Record<DiagnosticArea, number>;
}

export default function DiagnosticPage() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<DiagnosticResult | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("diagnostic_result");
            if (saved) setResult(JSON.parse(saved));
        } catch {
            // ignore
        }
    }, []);

    const handleSelect = (questionId: string, scoreValue: number) => {
        const updated = { ...answers, [questionId]: scoreValue };
        setAnswers(updated);

        if (step < DIAGNOSTIC_QUESTIONS.length - 1) {
            setTimeout(() => setStep((s) => s + 1), 180);
        } else {
            const areaTotals: Record<DiagnosticArea, number[]> = {
                math: [],
                reading: [],
                executive: [],
                self_regulation: [],
            };

            DIAGNOSTIC_QUESTIONS.forEach((q) => {
                areaTotals[q.area].push(updated[q.id] ?? 0);
            });

            const scores = (Object.keys(areaTotals) as DiagnosticArea[]).reduce((acc, area) => {
                const list = areaTotals[area];
                const avg = list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0;
                acc[area] = avg;
                return acc;
            }, {} as Record<DiagnosticArea, number>);

            const values = Object.values(scores);
            const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

            const finalResult: DiagnosticResult = {
                completedAt: new Date().toISOString(),
                overall,
                scores,
            };

            setResult(finalResult);
            try {
                localStorage.setItem("diagnostic_result", JSON.stringify(finalResult));
            } catch {
                // ignore
            }
        }
    };

    const resetDiagnostic = () => {
        setResult(null);
        setAnswers({});
        setStep(0);
        try {
            localStorage.removeItem("diagnostic_result");
        } catch {
            // ignore
        }
    };

    if (result) {
        const radarData = (Object.keys(result.scores) as DiagnosticArea[]).map((area) => ({
            subject: DIAGNOSTIC_AREA_META[area].label.split(" ")[0] + (area === "self_regulation" ? "" : ""),
            fullLabel: DIAGNOSTIC_AREA_META[area].label,
            puntaje: result.scores[area],
            fullMark: 100,
        }));

        const priorityArea = (Object.entries(result.scores) as [DiagnosticArea, number][]).sort(
            ([, a], [, b]) => a - b
        )[0][0];

        return (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
                            <CheckCircle size={14} /> Evaluación Completada
                        </span>
                        <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">
                            Tu Diagnóstico Cognitivo-Académico
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Índice global de preparación: <strong className="text-[var(--color-brand-600)]">{result.overall}%</strong>
                        </p>
                    </div>
                    <Button variant="outline" onClick={resetDiagnostic} className="gap-2">
                        <RotateCcw size={16} /> Repetir Diagnóstico
                    </Button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 surface-card rounded-2xl p-6">
                        <h2 className="font-bold text-slate-900 mb-2">Perfil Cognitivo-Académico</h2>
                        <p className="text-xs text-slate-500 mb-4">Balance entre tus 4 dimensiones clave</p>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#334155" }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                    <Radar
                                        name="Puntaje"
                                        dataKey="puntaje"
                                        stroke="#2563eb"
                                        fill="#2563eb"
                                        fillOpacity={0.28}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                        {(Object.keys(result.scores) as DiagnosticArea[]).map((area) => {
                            const score = result.scores[area];
                            const meta = DIAGNOSTIC_AREA_META[area];
                            return (
                                <div key={area} className="surface-card rounded-2xl p-5">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-slate-900">{meta.label}</h3>
                                        <span
                                            className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                                                score >= 75
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : score >= 50
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {score}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-[var(--color-brand-600)] rounded-full transition-all duration-500"
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-600">{meta.recommendation}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 rounded-2xl gradient-brand text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                            <Sparkles size={14} /> Prioridad Sugerida
                        </div>
                        <h3 className="text-xl font-bold">
                            Refuerza {DIAGNOSTIC_AREA_META[priorityArea].label} en tu Plan de Estudio
                        </h3>
                        <p className="text-sm text-slate-200">
                            Ya actualizamos tus recomendaciones para enfocarte en tu área de mayor impacto.
                        </p>
                    </div>
                    <Link href="/dashboard/study-plan">
                        <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold whitespace-nowrap">
                            Ir al Plan de Estudio <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const question = DIAGNOSTIC_QUESTIONS[step];
    const progress = Math.round(((step + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

    return (
        <div className="max-w-2xl mx-auto py-6 space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">
                            Diagnóstico Cognitivo-Académico
                        </h1>
                        <p className="text-sm text-slate-500">
                            Evaluación educativa no clínica • {DIAGNOSTIC_QUESTIONS.length} reactivos
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>
                        Reactivo {step + 1} de {DIAGNOSTIC_QUESTIONS.length} • {question.areaLabel}
                    </span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--color-brand-600)]"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.25 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card rounded-2xl p-7 space-y-6"
            >
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{question.prompt}</h2>
                <div className="space-y-3">
                    {question.options.map((opt, idx) => {
                        const selected = answers[question.id] === opt.value && answers[question.id] !== undefined;
                        return (
                            <button
                                type="button"
                                key={idx}
                                onClick={() => handleSelect(question.id, opt.value)}
                                className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                    selected
                                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-800)]"
                                        : "border-slate-200 hover:border-[var(--color-brand-300)] hover:bg-slate-50 text-slate-700"
                                }`}
                            >
                                <span className="font-bold mr-2 text-slate-400">
                                    {String.fromCharCode(65 + idx)}.
                                </span>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {step > 0 && (
                <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="text-sm text-slate-500 hover:text-slate-900 font-medium"
                >
                    ← Pregunta anterior
                </button>
            )}
        </div>
    );
}
