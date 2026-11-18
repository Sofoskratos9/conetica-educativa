"use client";

import { useEffect, useState } from "react";
import {
    PSYCHOMETRIC_TESTS,
    scorePsychometricTest,
    type PsychometricTestId,
    type PsychometricResult,
} from "@/lib/psychometric-tests";
import { Button } from "@/components/ui/Button";
import {
    Brain,
    CheckCircle2,
    Clock,
    ArrowLeft,
    BarChart3,
    RotateCcw,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

const TEST_LIST: PsychometricTestId[] = [
    "habitos_estudio_edaom",
    "estilos_aprendizaje_vak",
    "orientacion_vocacional_chaside",
    "inteligencia_emocional_baron",
];

const LIKERT_OPTIONS = [
    { value: 1, label: "Nunca" },
    { value: 2, label: "Rara vez" },
    { value: 3, label: "A veces" },
    { value: 4, label: "Casi siempre" },
    { value: 5, label: "Siempre" },
];

export default function PsychometricsPage() {
    const [activeTestId, setActiveTestId] = useState<PsychometricTestId | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [viewResult, setViewResult] = useState<PsychometricResult | null>(null);
    const [savedResults, setSavedResults] = useState<Record<string, PsychometricResult>>({});
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [startedAt, setStartedAt] = useState<number>(Date.now());

    useEffect(() => {
        fetch("/api/student/progress")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                const list = data?.progress?.psychometricResults;
                if (Array.isArray(list)) {
                    const map: Record<string, PsychometricResult> = {};
                    list.forEach((item: PsychometricResult) => {
                        map[item.testId] = item;
                    });
                    setSavedResults(map);
                }
            })
            .catch(() => {});
    }, []);

    const startTest = (id: PsychometricTestId) => {
        setActiveTestId(id);
        setAnswers({});
        setViewResult(null);
        setSaveMessage("");
        setStartedAt(Date.now());
    };

    const activeTest = activeTestId ? PSYCHOMETRIC_TESTS[activeTestId] : null;
    const totalQuestions = activeTest?.questions.length ?? 0;
    const answeredCount = activeTest
        ? activeTest.questions.filter((q) => typeof answers[q.id] === "number").length
        : 0;

    const handleSubmitTest = async () => {
        if (!activeTestId || !activeTest) return;
        const result = scorePsychometricTest(activeTestId, answers);
        const durationMinutes = Math.max(2, Math.round((Date.now() - startedAt) / 60000));

        setViewResult(result);
        setSaving(true);
        setSaveMessage("");
        try {
            const res = await fetch("/api/student/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "save_psychometric",
                    testId: result.testId,
                    testName: result.testName,
                    globalPercentage: result.globalPercentage,
                    topDimension: result.topDimension,
                    recommendation: result.recommendation,
                    dimensions: result.dimensions.map((d) => ({
                        dimension: d.dimension,
                        label: d.label,
                        percentage: d.percentage,
                        level: d.level,
                        interpretation: d.interpretation,
                    })),
                    durationMinutes,
                }),
            });
            if (res.ok) {
                setSavedResults((prev) => ({ ...prev, [result.testId]: result }));
                setSaveMessage("Evaluación guardada en tu historial real y sumada a tus XP.");
            } else {
                setSaveMessage("No se pudo guardar en el servidor. Intenta nuevamente.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (viewResult) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    type="button"
                    onClick={() => {
                        setViewResult(null);
                        setActiveTestId(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} /> Volver al Centro Psicométrico
                </button>

                <div className="surface-card rounded-2xl p-7 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Resultado Psicométrico Validado
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mt-1">{viewResult.testName}</h1>
                            <p className="text-sm text-slate-600 mt-1">{viewResult.recommendation}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--color-brand-50)] text-center min-w-36">
                            <div className="text-3xl font-extrabold text-[var(--color-brand-700)]">
                                {viewResult.globalPercentage}%
                            </div>
                            <div className="text-xs font-semibold text-slate-600">Índice Global</div>
                        </div>
                    </div>

                    {saveMessage && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 size={15} /> {saveMessage}
                        </div>
                    )}

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={viewResult.dimensions} margin={{ left: -15, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} />
                                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => [`${v ?? 0}%`, "Puntuación"]} />
                                <Bar dataKey="percentage" fill="#2563eb" radius={[8, 8, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {viewResult.dimensions.map((d) => (
                            <div key={d.dimension} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-bold text-slate-900">{d.label}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                            d.level === "alto"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : d.level === "medio"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {d.percentage}% · {d.level}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{d.interpretation}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => startTest(viewResult.testId)}
                            className="gap-1.5"
                        >
                            <RotateCcw size={15} /> Aplicar Nuevamente
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTest) {
        const pctProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveTestId(null)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft size={16} /> Cancelar evaluación
                    </button>
                    <div className="text-xs font-bold text-slate-600">
                        {answeredCount} / {totalQuestions} respondidas ({pctProgress}%)
                    </div>
                </div>

                <div className="surface-card rounded-2xl p-6 space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">{activeTest.name}</h1>
                    <p className="text-sm text-slate-600">{activeTest.description}</p>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                        <div
                            className="h-full bg-[var(--color-brand-600)] transition-all"
                            style={{ width: `${pctProgress}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {activeTest.questions.map((q, idx) => {
                        const val = answers[q.id];
                        return (
                            <div key={q.id} className="surface-card rounded-2xl p-5 space-y-3">
                                <p className="text-sm font-semibold text-slate-900">
                                    <span className="text-[var(--color-brand-600)] mr-2">{idx + 1}.</span>
                                    {q.text}
                                </p>

                                {q.scale === "si_no" ? (
                                    <div className="grid grid-cols-2 gap-2.5 max-w-xs">
                                        {[
                                            { label: "Sí", value: 1 },
                                            { label: "No", value: 0 },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                                                }
                                                className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-colors ${
                                                    val === opt.value
                                                        ? "bg-[var(--color-brand-600)] border-[var(--color-brand-600)] text-white"
                                                        : "bg-white border-slate-200 text-slate-700 hover:border-[var(--color-brand-400)]"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {LIKERT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                                                }
                                                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                                                    val === opt.value
                                                        ? "bg-[var(--color-brand-600)] border-[var(--color-brand-600)] text-white"
                                                        : "bg-white border-slate-200 text-slate-700 hover:border-[var(--color-brand-400)]"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="sticky bottom-4 surface-card p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg border border-slate-200">
                    <span className="text-xs text-slate-600">
                        {answeredCount === totalQuestions
                            ? "¡Listo! Ya puedes calcular y guardar tu perfil."
                            : `Faltan ${totalQuestions - answeredCount} pregunta(s) por responder.`}
                    </span>
                    <Button
                        disabled={answeredCount < totalQuestions || saving}
                        onClick={handleSubmitTest}
                    >
                        {saving ? "Calculando..." : "Finalizar y Ver Resultados"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">
                    Centro Psicométrico Validado
                </h1>
                <p className="text-slate-600 mt-1">
                    Instrumentos adaptados para México (EDAOM, VAK, CHASIDE y Bar-On) para descubrir cómo aprendes mejor y gestionar el estrés de admisión.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {TEST_LIST.map((id) => {
                    const test = PSYCHOMETRIC_TESTS[id];
                    const previous = savedResults[id];

                    return (
                        <div key={id} className="surface-card rounded-2xl p-6 flex flex-col justify-between space-y-5">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700">
                                        {test.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                                        <Clock size={13} /> ~{test.estimatedMinutes} min · {test.questions.length} reactivos
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Brain size={20} className="text-[var(--color-brand-600)] flex-shrink-0" />
                                    {test.name}
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">{test.description}</p>
                            </div>

                            {previous ? (
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                                        <span className="font-semibold text-emerald-900">
                                            Principal: {previous.topDimension}
                                        </span>
                                        <span className="font-bold text-emerald-700">
                                            {previous.globalPercentage}% global
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-1.5"
                                            onClick={() => setViewResult(previous)}
                                        >
                                            <BarChart3 size={14} /> Ver Reporte
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => startTest(id)}
                                        >
                                            Reevaluar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button onClick={() => startTest(id)} className="w-full">
                                    Iniciar Evaluación
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
