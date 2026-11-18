"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Compass,
    Timer,
    CheckCircle2,
    XCircle,
    Play,
    Pause,
    RotateCcw,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
} from "recharts";

const SAMPLE_QUESTIONS = [
    {
        id: 1,
        area: "Pensamiento Matemático",
        question:
            "Si el promedio de 4 calificaciones es 85 y las primeras tres son 80, 90 y 82, ¿cuál es la cuarta calificación?",
        options: ["86", "88", "90", "92"],
        correctIndex: 1,
        explanation:
            "La suma total debe ser 85 × 4 = 340. Sumando las tres primeras: 80 + 90 + 82 = 252. Por tanto, 340 − 252 = 88.",
    },
    {
        id: 2,
        area: "Pensamiento Analítico",
        question:
            "En una secuencia lógica: 3, 6, 12, 24, ___, ¿qué número completa correctamente la serie?",
        options: ["36", "42", "48", "54"],
        correctIndex: 2,
        explanation:
            "Cada término se multiplica por 2 respecto al anterior: 24 × 2 = 48.",
    },
];

const DEFAULT_RIASEC = [
    { code: "Realista", value: 60 },
    { code: "Investigador", value: 90 },
    { code: "Artístico", value: 55 },
    { code: "Social", value: 75 },
    { code: "Emprendedor", value: 65 },
    { code: "Convencional", value: 50 },
];

function getCareerSuggestion(scores: { code: string; value: number }[]): string {
    const sorted = [...scores].sort((a, b) => b.value - a.value);
    const top = sorted[0]?.code;
    switch (top) {
        case "Investigador":
            return "Ingeniería en Datos, Medicina, Biotecnología o Física Aplicada";
        case "Realista":
            return "Ingeniería Mecatrónica, Arquitectura o Robótica Industrial";
        case "Artístico":
            return "Diseño Digital, Comunicación Audiovisual o Arquitectura";
        case "Social":
            return "Psicología Educativa, Pedagogía, Enfermería o Trabajo Social";
        case "Emprendedor":
            return "Administración Estratégica, Comercio Internacional o Finanzas";
        default:
            return "Contaduría Pública, Actuaría o Ingeniería en Sistemas";
    }
}

export function InteractivePreview() {
    const [activeTab, setActiveTab] = useState<"exani" | "riasec" | "pomodoro">("exani");

    // EXANI mini simulator state
    const [qIndex, setQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // RIASEC live radar state
    const [riasec, setRiasec] = useState(DEFAULT_RIASEC);

    // Pomodoro live timer state
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [running]);

    const currentQuestion = SAMPLE_QUESTIONS[qIndex];
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const secs = String(secondsLeft % 60).padStart(2, "0");

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EFE7D8]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-brand-50)] border border-[var(--color-brand-600)] text-[var(--color-brand-600)] text-xs font-semibold uppercase tracking-wider mb-4">
                        <Sparkles size={14} /> Prueba la Plataforma en Vivo
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)] mb-3">
                        Interactúa ahora mismo, sin registro previo
                    </h2>
                    <p className="text-[var(--color-text-muted)] text-base sm:text-lg">
                        Explora una muestra real de nuestro simulador EXANI-II, la gráfica vocacional RIASEC y el temporizador de enfoque.
                    </p>
                </div>

                {/* Tab Selector */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {[
                        { id: "exani", label: "Simulador EXANI-II", icon: BookOpen },
                        { id: "riasec", label: "Radar RIASEC en Vivo", icon: Compass },
                        { id: "pomodoro", label: "Enfoque Pomodoro", icon: Timer },
                    ].map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as "exani" | "riasec" | "pomodoro")}
                                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? "bg-[var(--color-brand-600)] text-white shadow-lg"
                                        : "bg-[#FBF8F1] text-[#14532D] hover:bg-[#F5F1EA] border-2 border-[#14532D]"
                                }`}
                            >
                                <tab.icon size={17} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Interactive Workspace Card */}
                <div className="bg-[#FBF8F1] text-slate-900 rounded-[12px] p-6 sm:p-8 shadow-xl border-2 border-[#14532D]">
                    {activeTab === "exani" && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="px-3 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] text-xs font-bold">
                                    {currentQuestion.area}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    Reactivo {qIndex + 1} de {SAMPLE_QUESTIONS.length}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 leading-snug">
                                {currentQuestion.question}
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-3">
                                {currentQuestion.options.map((opt, idx) => {
                                    const isPicked = selectedOption === idx;
                                    const isCorrect = idx === currentQuestion.correctIndex;
                                    const showResult = selectedOption !== null;
                                    let style =
                                        "border-slate-200 bg-white hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]/40 text-slate-800";
                                    if (showResult && isCorrect) {
                                        style = "border-[#14532D] bg-[#EFE7D8] text-[#14532D] font-semibold";
                                    } else if (showResult && isPicked && !isCorrect) {
                                        style = "border-red-400 bg-red-50 text-red-900";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedOption(idx)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 text-left text-sm transition-all ${style}`}
                                        >
                                            <span>
                                                <strong className="mr-2">{String.fromCharCode(65 + idx)})</strong>
                                                {opt}
                                            </span>
                                            {showResult && isCorrect && (
                                                <CheckCircle2 size={18} className="text-[var(--color-brand-600)] flex-shrink-0" />
                                            )}
                                            {showResult && isPicked && !isCorrect && (
                                                <XCircle size={18} className="text-red-500 flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedOption !== null && (
                                <div className="p-4 rounded-xl bg-[#EFE7D8] border border-[#D8CDB2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-sm text-slate-700">
                                        <strong className="text-slate-900">Explicación:</strong>{" "}
                                        {currentQuestion.explanation}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
                                            setSelectedOption(null);
                                        }}
                                        className="px-4 py-2 rounded-lg bg-[var(--color-brand-600)] text-white text-xs font-semibold hover:bg-[var(--color-brand-700)] whitespace-nowrap"
                                    >
                                        Siguiente reactivo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "riasec" && (
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900">
                                    Ajusta tus intereses vocacionales
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Mueve cada dimensión para visualizar en tiempo real tu perfil Holland y carreras afines.
                                </p>
                                <div className="space-y-3">
                                    {riasec.map((item, idx) => (
                                        <div key={item.code}>
                                            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                                                <span>{item.code}</span>
                                                <span>{item.value}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={20}
                                                max={100}
                                                value={item.value}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setRiasec((prev) =>
                                                        prev.map((r, i) => (i === idx ? { ...r, value: val } : r))
                                                    );
                                                }}
                                                className="w-full accent-[#14532D]"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#EFE7D8] border border-[#14532D] text-xs text-[#14532D]">
                                    <strong>Carreras sugeridas:</strong> {getCareerSuggestion(riasec)}
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={riasec}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="code" tick={{ fontSize: 12, fill: "#334155" }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={false} />
                                        <Tooltip />
                                        <Radar
                                            name="Afinidad"
                                            dataKey="value"
                                            stroke="#14532D"
                                            fill="#C96F4A"
                                            fillOpacity={0.35}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === "pomodoro" && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-3 max-w-md">
                                <h3 className="text-xl font-bold text-slate-900">
                                    Sesión de enfoque (25 min)
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Entrena tu atención sostenida con bloques sin distracciones y pausas activas de consolidación.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setRunning((r) => !r)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
                                    >
                                        {running ? <Pause size={16} /> : <Play size={16} />}
                                        {running ? "Pausar" : "Iniciar Bloque"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRunning(false);
                                            setSecondsLeft(25 * 60);
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                                    >
                                        <RotateCcw size={16} /> Reiniciar
                                    </button>
                                </div>
                            </div>

                            <div className="px-10 py-6 rounded-2xl bg-[#14532D] text-white text-center min-w-[220px]">
                                <div className="text-xs uppercase tracking-widest text-[#F6DDCC] font-semibold mb-1">
                                    Temporizador Activo
                                </div>
                                <div className="text-5xl font-extrabold font-mono tracking-tight">
                                    {mins}:{secs}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                            ¿Quieres guardar tus resultados y generar tu plan semanal personalizado?
                        </span>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-brand-600)] hover:underline"
                        >
                            Probar Demo Completo (1 clic) <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
