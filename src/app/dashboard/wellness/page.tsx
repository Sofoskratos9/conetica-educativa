"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, STRATEGIES } from "@/lib/wellness-data";
import {
    LiveBinauralPlayer,
    downloadNeuroAudioWav,
    downloadNsdrAudioWav,
    type AudioSessionKind,
} from "@/lib/audio-synthesizer";
import {
    ArrowRight,
    Lightbulb,
    CheckCircle2,
    Headphones,
    Play,
    Square,
    Download,
    Wind,
    Volume2,
    Sparkles,
} from "lucide-react";

type BreathingMode = "4-7-8" | "box";

interface BreathingPhase {
    label: string;
    seconds: number;
    scale: string;
    instruction: string;
}

const BREATHING_PROTOCOLS: Record<BreathingMode, { name: string; subtitle: string; phases: BreathingPhase[] }> = {
    "4-7-8": {
        name: "Calma 4-7-8 (pre-examen)",
        subtitle: "Respirar con ritmo ayuda a recuperar la calma antes de un simulacro o evaluación.",
        phases: [
            { label: "Inhala lento", seconds: 4, scale: "scale-110", instruction: "Inspira por la nariz suavemente" },
            { label: "Sostén el aire", seconds: 7, scale: "scale-110", instruction: "Mantén la calma sin tensar hombros" },
            { label: "Exhala despacio", seconds: 8, scale: "scale-90", instruction: "Suelta el aire por la boca de forma continua" },
        ],
    },
    box: {
        name: "Respiración Cuadrada 4-4-4-4 (Enfoque)",
        subtitle: "Ideal entre bloques Pomodoro para recuperar claridad mental en menos de 2 minutos.",
        phases: [
            { label: "Inhala", seconds: 4, scale: "scale-110", instruction: "Inspira profundo en 4 tiempos" },
            { label: "Retén", seconds: 4, scale: "scale-110", instruction: "Mantén pulmones llenos" },
            { label: "Exhala", seconds: 4, scale: "scale-90", instruction: "Suelta el aire de forma uniforme" },
            { label: "Pausa", seconds: 4, scale: "scale-90", instruction: "Descansa antes del siguiente ciclo" },
        ],
    },
};

export default function WellnessDashboardPage() {
    const dailyRec = STRATEGIES["clarity"][0];
    const [completedCount, setCompletedCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Binaural audio state
    const playerRef = useRef<LiveBinauralPlayer | null>(null);
    const [playingKind, setPlayingKind] = useState<AudioSessionKind | null>(null);
    const [volume, setVolume] = useState(0.25);
    const [savingAudio, setSavingAudio] = useState(false);

    // Breathing pacer state
    const [breathMode, setBreathMode] = useState<BreathingMode>("4-7-8");
    const [breathRunning, setBreathRunning] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(BREATHING_PROTOCOLS["4-7-8"].phases[0].seconds);
    const [cyclesDone, setCyclesDone] = useState(0);

    const recordWellnessPractice = async (
        strategyId: string,
        strategyTitle: string,
        durationMinutes: number
    ) => {
        try {
            const res = await fetch("/api/student/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "complete_wellness",
                    strategyId,
                    strategyTitle,
                    durationMinutes,
                    completed: true,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data?.progress?.wellnessCompletedIds)) {
                    setCompletedCount(data.progress.wellnessCompletedIds.length);
                } else {
                    setCompletedCount((prev) => prev + 1);
                }
                setStatusMessage(`Sesión registrada: ${strategyTitle} (+${durationMinutes} min en tu historial).`);
            }
        } catch {
            // Keep UI responsive
        }
    };

    useEffect(() => {
        fetch("/api/student/progress")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (Array.isArray(data?.progress?.wellnessCompletedIds)) {
                    setCompletedCount(data.progress.wellnessCompletedIds.length);
                }
            })
            .catch(() => {});

        return () => {
            playerRef.current?.stop();
        };
    }, []);

    useEffect(() => {
        if (!breathRunning) return;
        const protocol = BREATHING_PROTOCOLS[breathMode];
        const timer = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev > 1) return prev - 1;
                const nextPhase = (phaseIndex + 1) % protocol.phases.length;
                setPhaseIndex(nextPhase);
                if (nextPhase === 0) {
                    setCyclesDone((c) => {
                        const updated = c + 1;
                        if (updated >= 4) {
                            setBreathRunning(false);
                            void recordWellnessPractice(
                                `breathing-${breathMode}`,
                                protocol.name,
                                3
                            );
                        }
                        return updated;
                    });
                }
                return protocol.phases[nextPhase].seconds;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [breathRunning, breathMode, phaseIndex]);

    const toggleAudio = (kind: AudioSessionKind) => {
        if (!playerRef.current) {
            playerRef.current = new LiveBinauralPlayer();
        }
        if (playingKind === kind) {
            playerRef.current.stop();
            setPlayingKind(null);
            return;
        }
        playerRef.current.start(kind, volume);
        setPlayingKind(kind);
    };

    const handleVolumeChange = (nextVol: number) => {
        setVolume(nextVol);
        playerRef.current?.setVolume(nextVol);
    };

    const handleLogAudioSession = async (kind: AudioSessionKind) => {
        setSavingAudio(true);
        await recordWellnessPractice(
            kind,
            kind === "neuro-focus"
                ? "Audio para concentrarte"
                : "Audio para descansar la mente",
            kind === "neuro-focus" ? 3 : 4
        );
        setSavingAudio(false);
    };

    const switchBreathMode = (mode: BreathingMode) => {
        setBreathRunning(false);
        setBreathMode(mode);
        setPhaseIndex(0);
        setCyclesDone(0);
        setSecondsLeft(BREATHING_PROTOCOLS[mode].phases[0].seconds);
    };

    const activeProtocol = BREATHING_PROTOCOLS[breathMode];
    const currentPhase = activeProtocol.phases[phaseIndex] || activeProtocol.phases[0];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Bienestar Académico</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Herramientas de audio, respiración guiada y pausas para estudiar con calma.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    {completedCount} estrategia(s) practicada(s)
                </div>
            </div>

            {statusMessage && (
                <div className="rounded-xl border-2 border-[#14532D] bg-[#EFE7D8] px-4 py-3 text-sm font-medium text-[#14532D] flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                        <Sparkles size={16} /> {statusMessage}
                    </span>
                    <button
                        type="button"
                        onClick={() => setStatusMessage(null)}
                        className="text-xs font-bold text-[var(--color-brand-700)] hover:underline"
                    >
                        Ocultar
                    </button>
                </div>
            )}

            <div className="bg-[#EFE7D8] border-2 border-[#14532D] rounded-[12px] p-6 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#FBF8F1] border border-[#14532D] rounded-xl">
                        <Lightbulb size={24} className="text-[#D9A441]" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Estrategia Recomendada</div>
                        <h3 className="text-xl font-bold mb-2 text-[var(--color-brand-900)]">{dailyRec.title}</h3>
                        <p className="text-[var(--color-text-muted)] mb-4 max-w-2xl">
                            {dailyRec.description}
                        </p>
                        <Link href="/dashboard/wellness/clarity" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-brand-700)] hover:underline">
                            Ver técnica completa <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Audio + Respiración guiada */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Binaural Audio Lab */}
                <div className="surface-card p-6 rounded-2xl space-y-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Headphones size={20} className="text-[var(--color-brand-600)]" />
                                Audio para estudiar
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Sonido estéreo en tiempo real vía Web Audio API (usa audífonos).
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Volume2 size={15} />
                            <input
                                type="range"
                                min={0.05}
                                max={0.6}
                                step={0.05}
                                value={volume}
                                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                aria-label="Volumen del audio"
                                className="w-20 accent-[#14532D]"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Audio para concentrarte + Pad Armónico</h3>
                                    <p className="text-xs text-slate-500">
                                        Sonido estéreo suave para acompañar tu concentración.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleAudio("neuro-focus")}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                                        playingKind === "neuro-focus"
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)]"
                                    }`}
                                >
                                    {playingKind === "neuro-focus" ? <Square size={14} /> : <Play size={14} />}
                                    {playingKind === "neuro-focus" ? "Detener" : "Reproducir"}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={downloadNeuroAudioWav}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
                                >
                                    <Download size={13} /> Descargar WAV (3 min)
                                </button>
                                <button
                                    type="button"
                                    disabled={savingAudio}
                                    onClick={() => handleLogAudioSession("neuro-focus")}
                                    className="px-3 py-1.5 rounded-lg bg-[#EFE7D8] border border-[#14532D] text-xs font-semibold text-[var(--color-brand-700)] hover:bg-[#E9E2D3] inline-flex items-center gap-1.5 disabled:opacity-60"
                                >
                                    <CheckCircle2 size={13} /> Registrar práctica en progreso
                                </button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Audio para descansar la mente</h3>
                                    <p className="text-xs text-slate-500">
                                        Descenso progresivo para descansar la mente y reducir fatiga entre exámenes.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleAudio("nsdr-calm")}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                                        playingKind === "nsdr-calm"
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)]"
                                    }`}
                                >
                                    {playingKind === "nsdr-calm" ? <Square size={14} /> : <Play size={14} />}
                                    {playingKind === "nsdr-calm" ? "Detener" : "Reproducir"}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={downloadNsdrAudioWav}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
                                >
                                    <Download size={13} /> Descargar WAV (4 min)
                                </button>
                                <button
                                    type="button"
                                    disabled={savingAudio}
                                    onClick={() => handleLogAudioSession("nsdr-calm")}
                                    className="px-3 py-1.5 rounded-lg bg-[#EFE7D8] border border-[#14532D] text-xs font-semibold text-[var(--color-brand-700)] hover:bg-[#E9E2D3] inline-flex items-center gap-1.5 disabled:opacity-60"
                                >
                                    <CheckCircle2 size={13} /> Registrar práctica en progreso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guided Breathing Pacer */}
                <div className="surface-card p-6 rounded-2xl flex flex-col justify-between space-y-5">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Wind size={20} className="text-[var(--color-brand-600)]" />
                                Guía Visual de Respiración
                            </h2>
                            <div className="inline-flex rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => switchBreathMode("4-7-8")}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                        breathMode === "4-7-8" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                                    }`}
                                >
                                    4-7-8 Calma
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchBreathMode("box")}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                        breathMode === "box" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                                    }`}
                                >
                                    4-4-4-4 Enfoque
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">{activeProtocol.subtitle}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4">
                        <div
                            className={`w-36 h-36 rounded-full bg-[#EFE7D8] border-4 border-[#14532D]/40 flex flex-col items-center justify-center transition-transform duration-1000 ${
                                breathRunning ? currentPhase.scale : "scale-100"
                            }`}
                        >
                            <span className="text-3xl font-extrabold text-[var(--color-brand-900)] tabular-nums">
                                {secondsLeft}s
                            </span>
                            <span className="text-xs font-bold text-[var(--color-brand-700)] uppercase tracking-wide mt-1">
                                {breathRunning ? currentPhase.label : "Listo"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-4 text-center">
                            {breathRunning
                                ? currentPhase.instruction
                                : "Completa 4 ciclos seguidos para registrar automáticamente tu sesión."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500">
                            Ciclos completados: <strong className="text-slate-800">{cyclesDone}/4</strong>
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!breathRunning) {
                                        if (cyclesDone >= 4) setCyclesDone(0);
                                        setBreathRunning(true);
                                    } else {
                                        setBreathRunning(false);
                                    }
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                                    breathRunning
                                        ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                                        : "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)]"
                                }`}
                            >
                                {breathRunning ? <Square size={14} /> : <Play size={14} />}
                                {breathRunning ? "Pausar" : "Iniciar 4 ciclos"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

