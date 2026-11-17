"use client";

import { useState, useEffect } from "react";
import {
    BookOpen,
    CheckCircle2,
    Circle,
    Play,
    Pause,
    RotateCcw,
    Plus,
    Timer,
    Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StudyTask {
    id: string;
    title: string;
    area: string;
    durationMin: number;
    day: string;
    completed: boolean;
}

const INITIAL_TASKS: StudyTask[] = [
    {
        id: "t1",
        title: "Resolver 15 reactivos de proporcionalidad y álgebra lineal",
        area: "Pensamiento Matemático",
        durationMin: 40,
        day: "Lunes",
        completed: true,
    },
    {
        id: "t2",
        title: "Lectura crítica: identificar tesis y contraargumentos (2 textos)",
        area: "Comprensión Lectora",
        durationMin: 30,
        day: "Martes",
        completed: true,
    },
    {
        id: "t3",
        title: "Simulacro cronometrado de Pensamiento Analítico",
        area: "Pensamiento Analítico",
        durationMin: 45,
        day: "Miércoles",
        completed: false,
    },
    {
        id: "t4",
        title: "Repaso espaciado: acentuación diacrítica y concordancia",
        area: "Estructura de la Lengua",
        durationMin: 25,
        day: "Jueves",
        completed: false,
    },
    {
        id: "t5",
        title: "Revisión de errores de la semana y flashcards activas",
        area: "Metacognición",
        durationMin: 30,
        day: "Viernes",
        completed: false,
    },
];

export default function StudyPlanPage() {
    const [tasks, setTasks] = useState<StudyTask[]>(INITIAL_TASKS);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskArea, setNewTaskArea] = useState("Pensamiento Matemático");

    // Pomodoro state
    const [mode, setMode] = useState<"focus25" | "focus50" | "break5">("focus25");
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(2);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("study_plan_tasks");
            if (saved) setTasks(JSON.parse(saved));
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("study_plan_tasks", JSON.stringify(tasks));
        } catch {
            // ignore
        }
    }, [tasks]);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setRunning(false);
                    if (mode !== "break5") setCompletedCycles((c) => c + 1);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [running, mode]);

    const switchMode = (nextMode: "focus25" | "focus50" | "break5") => {
        setRunning(false);
        setMode(nextMode);
        setSecondsLeft(nextMode === "focus25" ? 25 * 60 : nextMode === "focus50" ? 50 * 60 : 5 * 60);
    };

    const toggleTask = (id: string) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const item: StudyTask = {
            id: `t_${Date.now()}`,
            title: newTaskTitle.trim(),
            area: newTaskArea,
            durationMin: 25,
            day: "Hoy",
            completed: false,
        };
        setTasks((prev) => [item, ...prev]);
        setNewTaskTitle("");
    };

    const completedCount = tasks.filter((t) => t.completed).length;
    const progressPct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const secs = String(secondsLeft % 60).padStart(2, "0");

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)] flex items-center gap-3">
                        <BookOpen className="text-[var(--color-brand-600)]" /> Plan de Estudio Personalizado
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Combina bloques de estudio espaciado con ciclos Pomodoro de enfoque profundo.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-sm font-semibold">
                    <Flame size={18} className="text-emerald-600" />
                    <span>{completedCycles} bloques completados hoy</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Pomodoro Timer */}
                <div className="lg:col-span-5">
                    <div className="gradient-brand text-white rounded-2xl p-7 shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                                <Timer size={15} /> Temporizador Pomodoro
                            </span>
                            <div className="flex gap-1.5">
                                {[
                                    { id: "focus25", label: "25m" },
                                    { id: "focus50", label: "50m" },
                                    { id: "break5", label: "5m Descanso" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => switchMode(m.id as any)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                            mode === m.id
                                                ? "bg-emerald-500 text-slate-950"
                                                : "bg-white/10 text-slate-200 hover:bg-white/20"
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center py-6">
                            <div className="text-6xl font-extrabold tracking-tight font-mono">
                                {mins}:{secs}
                            </div>
                            <p className="text-xs text-slate-300 mt-2">
                                {mode === "break5"
                                    ? "Descansa la vista, hidrátate y estírate"
                                    : "Silencia notificaciones y enfócate en una sola meta"}
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <Button
                                onClick={() => setRunning(!running)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8"
                            >
                                {running ? (
                                    <>
                                        <Pause size={18} className="mr-2" /> Pausar
                                    </>
                                ) : (
                                    <>
                                        <Play size={18} className="mr-2" /> Iniciar
                                    </>
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={() => switchMode(mode)}
                                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label="Reiniciar temporizador"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Weekly Checklist */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="surface-card rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Metas de la Semana</h2>
                                <p className="text-xs text-slate-500">
                                    {completedCount} de {tasks.length} sesiones completadas ({progressPct}%)
                                </p>
                            </div>
                            <span className="text-lg font-extrabold text-[var(--color-brand-600)]">
                                {progressPct}%
                            </span>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>

                        <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2.5 pt-2">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Agregar nueva sesión de estudio..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            />
                            <select
                                value={newTaskArea}
                                onChange={(e) => setNewTaskArea(e.target.value)}
                                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                                aria-label="Área de estudio"
                            >
                                <option>Pensamiento Matemático</option>
                                <option>Comprensión Lectora</option>
                                <option>Pensamiento Analítico</option>
                                <option>Estructura de la Lengua</option>
                            </select>
                            <Button type="submit" size="sm" className="gap-1.5">
                                <Plus size={16} /> Añadir
                            </Button>
                        </form>

                        <div className="space-y-3 pt-2">
                            {tasks.map((task) => (
                                <button
                                    type="button"
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                                        task.completed
                                            ? "bg-slate-50 border-slate-200 opacity-75"
                                            : "bg-white border-slate-200 hover:border-[var(--color-brand-300)]"
                                    }`}
                                >
                                    {task.completed ? (
                                        <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <Circle size={20} className="text-slate-300 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className={`text-sm font-semibold ${
                                                task.completed ? "line-through text-slate-500" : "text-slate-900"
                                            }`}
                                        >
                                            {task.title}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                                {task.area}
                                            </span>
                                            <span>• {task.day}</span>
                                            <span>• {task.durationMin} min</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
