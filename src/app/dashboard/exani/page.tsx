"use client";

import { useEffect, useMemo, useState } from "react";
import { EXANI_QUESTIONS, type ExaniArea, type ExaniQuestion } from "@/lib/exani-data";
import { UAA_CAREERS, EXAM_SOURCES_INFO, getUaaCycleContext } from "@/lib/exam-cycle";
import { Button } from "@/components/ui/Button";
import {
    TrendingUp,
    CheckCircle2,
    XCircle,
    RotateCcw,
    BookOpen,
    ArrowRight,
    Calculator,
    GraduationCap,
    Download,
    Zap,
} from "lucide-react";

const AREAS: ("Todas" | ExaniArea)[] = [
    "Todas",
    "Comprensión Lectora",
    "Pensamiento Matemático",
    "Pensamiento Analítico",
    "Estructura de la Lengua",
];

export default function ExaniSimulatorPage() {
    const cycle = getUaaCycleContext();
    const [activeTab, setActiveTab] = useState<"simulator" | "calculator">("simulator");
    const [bank, setBank] = useState<ExaniQuestion[]>(EXANI_QUESTIONS);
    const [selectedArea, setSelectedArea] = useState<"Todas" | ExaniArea>("Todas");
    const [practiceMode, setPracticeMode] = useState<"full" | "sprint10">("sprint10");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [finished, setFinished] = useState(false);
    const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [startedAt, setStartedAt] = useState<number>(() => Date.now());

    // UAA & CENEVAL Calculator state (ported from MiguelBot-/src/StudyTools.tsx)
    const [careerId, setCareerId] = useState<string>("medicina");
    const [lecturaHits, setLecturaHits] = useState<number>(8);
    const [matematicoHits, setMatematicoHits] = useState<number>(7);
    const [redaccionHits, setRedaccionHits] = useState<number>(8);
    const [bachPromedio, setBachPromedio] = useState<number>(8.8);

    useEffect(() => {
        fetch("/api/questions")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (Array.isArray(data?.questions) && data.questions.length > 0) {
                    setBank(data.questions);
                }
            })
            .catch(() => {});
    }, []);

    const questions = useMemo(() => {
        const filtered =
            selectedArea === "Todas" ? bank : bank.filter((q) => q.area === selectedArea);
        if (practiceMode === "sprint10" && selectedArea === "Todas") {
            return filtered.slice(0, 10);
        }
        return filtered;
    }, [bank, selectedArea, practiceMode]);

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

    const handleDownloadStudyGuide = () => {
        const wrongOrAnswered = questions.filter((q) => typeof answers[q.id] === "number");
        const lines = [
            `GUÍA DE REPASO PERSONALIZADA EXANI-II · ${cycle.editionLabel}`,
            `Área: ${selectedArea}`,
            "==========================================================",
            "",
            ...wrongOrAnswered.map((q, i) => {
                const userIdx = answers[q.id];
                const isOk = userIdx === q.correctIndex;
                return [
                    `${i + 1}. [${q.area} · ${q.difficulty}] ${q.question}`,
                    `   Tu respuesta: ${String.fromCharCode(65 + userIdx)} (${isOk ? "CORRECTA" : "POR REFORZAR"})`,
                    `   Respuesta correcta: ${String.fromCharCode(65 + q.correctIndex)}. ${q.options[q.correctIndex]}`,
                    `   Explicación: ${q.explanation}`,
                    "",
                ].join("\n");
            }),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `guia-repaso-exani-${cycle.targetAdmissionYear}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // CENEVAL Calculator computations
    const totalHits = lecturaHits + matematicoHits + redaccionHits;
    const accuracyPct = Math.round((totalHits / 30) * 100);
    const estimatedCeneval = 700 + Math.round((totalHits / 30) * 600);
    const selectedCareer = UAA_CAREERS.find((c) => c.id === careerId) || UAA_CAREERS[0];
    const scoreDiff = estimatedCeneval - selectedCareer.targetScore;
    const uaaComposite = Math.round(
        ((estimatedCeneval - 700) / 600) * 70 + (bachPromedio / 10) * 30
    );

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
                        Área evaluada: <strong>{selectedArea}</strong> ({cycle.shortCycleTag})
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
                        {savedStatus === "saved" && "Resultado guardado en tu historial y progreso real."}
                        {savedStatus === "error" && "No se pudo guardar en el servidor. Intenta nuevamente."}
                    </p>

                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <Button variant="outline" onClick={handleDownloadStudyGuide} className="gap-2">
                            <Download size={16} /> Descargar Guía de Repaso
                        </Button>
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
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        {cycle.editionLabel}
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)] mt-0.5">
                        Simulador EXANI-II &amp; Semáforo UAA
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm">
                        Banco completo de {bank.length} reactivos comentados (incluyendo reactivos oficiales y personalizados por tu tutor).
                    </p>
                </div>
            </div>

            {/* Mode Switch */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("simulator")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        activeTab === "simulator"
                            ? "bg-[var(--color-brand-600)] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    <GraduationCap size={16} /> Simulador ({bank.length} Reactivos)
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("calculator")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        activeTab === "calculator"
                            ? "bg-[var(--color-brand-600)] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    <Calculator size={16} /> Calculadora CENEVAL y Semáforo UAA
                </button>
            </div>

            {activeTab === "calculator" ? (
                <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Proyección de Puntaje CENEVAL y Corte UAA {cycle.targetAdmissionYear}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{EXAM_SOURCES_INFO.uaaWeighting}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                                    Carrera objetivo en la UAA
                                </label>
                                <select
                                    value={careerId}
                                    onChange={(e) => setCareerId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                                >
                                    {UAA_CAREERS.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.label} — Meta {c.targetScore} pts
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">{selectedCareer.note}</p>
                            </div>

                            {[
                                {
                                    label: "Comprensión Lectora",
                                    val: lecturaHits,
                                    set: setLecturaHits,
                                },
                                {
                                    label: "Pensamiento Matemático-Analítico",
                                    val: matematicoHits,
                                    set: setMatematicoHits,
                                },
                                {
                                    label: "Redacción Indirecta",
                                    val: redaccionHits,
                                    set: setRedaccionHits,
                                },
                            ].map((slider) => (
                                <div key={slider.label} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                                        <span>{slider.label}</span>
                                        <span>{slider.val} / 10 aciertos</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        value={slider.val}
                                        onChange={(e) => slider.set(Number(e.target.value))}
                                        className="w-full accent-[var(--color-brand-600)]"
                                    />
                                </div>
                            ))}

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-slate-700">
                                    <span>Promedio de Bachillerato (30% UAA)</span>
                                    <span>{bachPromedio.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={6.0}
                                    max={10.0}
                                    step={0.1}
                                    value={bachPromedio}
                                    onChange={(e) => setBachPromedio(Number(e.target.value))}
                                    className="w-full accent-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                    Puntaje Proyectado CENEVAL
                                </div>
                                <div className="text-4xl font-extrabold">{estimatedCeneval} pts</div>
                                <div className="text-xs text-slate-300">
                                    {totalHits}/30 aciertos ({accuracyPct}%) · Meta carrera: {selectedCareer.targetScore} pts
                                </div>
                                <div
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                                        scoreDiff >= 0
                                            ? "bg-emerald-500/20 text-emerald-300"
                                            : "bg-amber-500/20 text-amber-300"
                                    }`}
                                >
                                    {scoreDiff >= 0
                                        ? `+${scoreDiff} pts por encima de la meta referencial`
                                        : `${Math.abs(scoreDiff)} pts por debajo de la meta referencial`}
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                                    <span>Índice Compuesto Ponderado UAA</span>
                                    <span className="text-[var(--color-brand-700)]">{uaaComposite} / 100</span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {EXAM_SOURCES_INFO.typicalWindow}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
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

                        {selectedArea === "Todas" && (
                            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPracticeMode("sprint10");
                                        resetSimulator();
                                    }}
                                    className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1 ${
                                        practiceMode === "sprint10"
                                            ? "bg-white shadow-sm text-slate-900"
                                            : "text-slate-600"
                                    }`}
                                >
                                    <Zap size={12} /> Sprint (10)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPracticeMode("full");
                                        resetSimulator();
                                    }}
                                    className={`px-3 py-1.5 rounded-lg ${
                                        practiceMode === "full"
                                            ? "bg-white shadow-sm text-slate-900"
                                            : "text-slate-600"
                                    }`}
                                >
                                    Completo ({bank.length})
                                </button>
                            </div>
                        )}
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
                                    {currentQ.source === "custom" && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                                            Agregado por Conética
                                        </span>
                                    )}
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
                                            styleClass =
                                                "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
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
                                            {currentIndex < questions.length - 1
                                                ? "Siguiente Reactivo"
                                                : "Ver Puntaje Final"}
                                            <ArrowRight size={15} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
