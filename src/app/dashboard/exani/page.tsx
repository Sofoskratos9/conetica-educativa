"use client";

import { useState, useMemo } from "react";
import { EXANI_QUESTIONS, type ExaniArea } from "@/lib/exani-data";
import { Button } from "@/components/ui/Button";
import {
    TrendingUp,
    CheckCircle2,
    XCircle,
    RotateCcw,
    BookOpen,
    ArrowRight,
} from "lucide-react";

const AREAS: ("Todas" | ExaniArea)[] = [
    "Todas",
    "Pensamiento Matemático",
    "Pensamiento Analítico",
    "Estructura de la Lengua",
    "Comprensión Lectora",
];

export default function ExaniSimulatorPage() {
    const [selectedArea, setSelectedArea] = useState<"Todas" | ExaniArea>("Todas");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [finished, setFinished] = useState(false);
    const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [startedAt, setStartedAt] = useState<number>(() => Date.now());

    const questions = useMemo(
        () =>
            selectedArea === "Todas"
                ? EXANI_QUESTIONS
                : EXANI_QUESTIONS.filter((q) => q.area === selectedArea),
        [selectedArea]
    );

    const handleAreaChange = (area: "Todas" | ExaniArea) => {
        setSelectedArea(area);
        setCurrentIndex(0);
        setSelectedOption(null);
        setAnswers({});
        setFinished(false);
        setSavedStatus("idle");
        setStartedAt(Date.now());
    };

    const currentQ = questions[currentIndex];

    const handleChooseOption = (idx: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(idx);
        setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
            setSelectedOption(null);
        } else {
            const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
            const pct = Math.round((correctCount / questions.length) * 100);
            const cScore = Math.round(700 + (correctCount / questions.length) * 600);
            const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

            setFinished(true);
            setSavedStatus("saving");
            try {
                const res = await fetch("/api/student/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "save_exani",
                        area: selectedArea,
                        correctCount,
                        totalQuestions: questions.length,
                        percentage: pct,
                        cenevalScore: cScore,
                        durationMinutes: elapsedMinutes,
                    }),
                });
                setSavedStatus(res.ok ? "saved" : "error");
            } catch {
                setSavedStatus("error");
            }
        }
    };

    const resetSimulator = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setAnswers({});
        setFinished(false);
        setSavedStatus("idle");
        setStartedAt(Date.now());
    };

    if (finished) {
        const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
        const pct = Math.round((correctCount / questions.length) * 100);
        const cenevalScore = Math.round(700 + (correctCount / questions.length) * 600);

        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="surface-card rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <TrendingUp size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Resultado del Simulador EXANI-II</h1>
                    <p className="text-slate-600">
                        Área evaluada: <strong>{selectedArea}</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-2xl font-extrabold text-[var(--color-brand-600)]">{cenevalScore}</div>
                            <div className="text-xs text-slate-500">Escala CENEVAL</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-2xl font-extrabold text-emerald-600">{pct}%</div>
                            <div className="text-xs text-slate-500">Aciertos</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-2xl font-extrabold text-slate-900">
                                {correctCount}/{questions.length}
                            </div>
                            <div className="text-xs text-slate-500">Reactivos</div>
                        </div>
                    </div>

                    <p className="text-xs font-medium text-slate-500">
                        {savedStatus === "saving" && "Guardando intento en tu historial..."}
                        {savedStatus === "saved" && "Resultado guardado en tu historial y progreso."}
                        {savedStatus === "error" && "No se pudo guardar en el servidor. Intenta nuevamente."}
                    </p>

                    <div className="pt-2">
                        <Button onClick={resetSimulator} className="gap-2">
                            <RotateCcw size={16} /> Practicar Nuevamente
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">
                        Simulador EXANI-II &amp; UAA
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Entrena con reactivos comentados y retroalimentación inmediata basada en la guía CENEVAL.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {AREAS.map((area) => (
                    <button
                        type="button"
                        key={area}
                        onClick={() => handleAreaChange(area)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            selectedArea === area
                                ? "bg-[var(--color-brand-600)] text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:border-[var(--color-brand-400)]"
                        }`}
                    >
                        {area}
                    </button>
                ))}
            </div>

            {currentQ && (
                <div className="surface-card rounded-2xl p-7 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                                {currentQ.area}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                                Nivel {currentQ.difficulty}
                            </span>
                        </div>
                        <span className="text-slate-500 font-semibold">
                            Reactivo {currentIndex + 1} de {questions.length}
                        </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                        {currentQ.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                            const isAnswered = selectedOption !== null;
                            const isCorrect = idx === currentQ.correctIndex;
                            const isPicked = idx === selectedOption;

                            let styleClass =
                                "border-slate-200 bg-white hover:border-[var(--color-brand-400)] text-slate-800";
                            if (isAnswered) {
                                if (isCorrect) {
                                    styleClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                                } else if (isPicked) {
                                    styleClass = "border-red-400 bg-red-50 text-red-900";
                                } else {
                                    styleClass = "border-slate-200 bg-slate-50 text-slate-500";
                                }
                            }

                            return (
                                <button
                                    type="button"
                                    key={idx}
                                    disabled={isAnswered}
                                    onClick={() => handleChooseOption(idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-sm ${styleClass}`}
                                >
                                    <span>
                                        <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong>
                                        {opt}
                                    </span>
                                    {isAnswered && isCorrect && (
                                        <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                                    )}
                                    {isAnswered && isPicked && !isCorrect && (
                                        <XCircle size={18} className="text-red-500 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {selectedOption !== null && (
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                                <BookOpen size={14} /> Explicación Paso a Paso
                            </div>
                            <p className="text-sm text-blue-900">{currentQ.explanation}</p>
                            <div className="pt-2 flex justify-end">
                                <Button onClick={handleNext} size="sm" className="gap-1.5">
                                    {currentIndex < questions.length - 1 ? "Siguiente Reactivo" : "Ver Puntaje Final"}
                                    <ArrowRight size={15} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
