"use client";

import { useState, useEffect, useCallback } from "react";
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
    Sparkles,
    Trash2,
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

export default function StudyPlanPage() {
    const [tasks, setTasks] = useState<StudyTask[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskArea, setNewTaskArea] = useState("Pensamiento Matemático");

    // Pomodoro state
    const [mode, setMode] = useState<"focus25" | "focus50" | "break5">("focus25");
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);

    const loadData = useCallback(async () => {
        setLoadingTasks(true);
        try {
            const [tasksRes, progRes] = await Promise.all([
                fetch("/api/student/tasks"),
                fetch("/api/student/progress"),
            ]);
            if (tasksRes.ok) {
                const tData = await tasksRes.json().catch(() => ({}));
                setTasks(tData.tasks || []);
            }
            if (progRes.ok) {
                const pData = await progRes.json().catch(() => ({}));
                if (typeof pData?.progress?.pomodoroCyclesToday === "number") {
                    setCompletedCycles(pData.progress.pomodoroCyclesToday);
                }
            }
        } finally {
            setLoadingTasks(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const recordPomodoroCycle = useCallback(async (minutes: number) => {
        setCompletedCycles((c) => c + 1);
        await fetch("/api/student/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "log_pomodoro",
                durationMinutes: minutes,
            }),
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setRunning(false);
                    if (mode !== "break5") {
                        void recordPomodoroCycle(mode === "focus25" ? 25 : 50);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [running, mode, recordPomodoroCycle]);

    const switchMode = (nextMode: "focus25" | "focus50" | "break5") => {
        setRunning(false);
        setMode(nextMode);
        setSecondsLeft(nextMode === "focus25" ? 25 * 60 : nextMode === "focus50" ? 50 * 60 : 5 * 60);
    };

    const toggleTask = async (id: string) => {
        const current = tasks.find((t) => t.id === id);
        if (!current) return;
        const nextCompleted = !current.completed;
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)));
        const res = await fetch("/api/student/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, completed: nextCompleted }),
        });
        if (!res.ok) {
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: current.completed } : t)));
        }
    };

    const deleteTask = async (id: string) => {
        const prevList = tasks;
        setTasks((prev) => prev.filter((t) => t.id !== id));
        const res = await fetch(`/api/student/tasks?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            setTasks(prevList);
        }
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const title = newTaskTitle.trim();
        setNewTaskTitle("");
        const res = await fetch("/api/student/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                area: newTaskArea,
                durationMin: 25,
                day: "Hoy",
            }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.task) {
            setTasks((prev) => [data.task, ...prev]);
        }
    };

    const seedRecommendedPlan = async () => {
        setSeeding(true);
        try {
            const res = await fetch("/api/student/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "seed_recommended" }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && Array.isArray(data.tasks)) {
                setTasks(data.tasks);
            }
        } finally {
            setSeeding(false);
        }
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
                        Combina bloques de estudio espaciado con ciclos Pomodoro registrados en tu cuenta.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-sm font-semibold">
                    <Flame size={18} className="text-emerald-600" />
                    <span>{completedCycles} bloque(s) completados hoy</span>
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
                                        onClick={() => switchMode(m.id as "focus25" | "focus50" | "break5")}
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
                                    : "Al terminar el bloque se sumará automáticamente a tus horas de estudio"}
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
                            {loadingTasks ? (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    Cargando tus metas de estudio...
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                                    <p className="text-sm text-slate-600">
                                        Aún no tienes metas registradas. Agrega una arriba o genera un plan sugerido basado en tu diagnóstico.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={seedRecommendedPlan}
                                        disabled={seeding}
                                        className="gap-2"
                                    >
                                        <Sparkles size={15} />
                                        {seeding ? "Generando plan..." : "Generar plan semanal sugerido"}
                                    </Button>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                                            task.completed
                                                ? "bg-slate-50 border-slate-200 opacity-80"
                                                : "bg-white border-slate-200 hover:border-[var(--color-brand-300)]"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleTask(task.id)}
                                            className="mt-0.5 flex-shrink-0 text-left"
                                            aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 size={20} className="text-emerald-600" />
                                            ) : (
                                                <Circle size={20} className="text-slate-300 hover:text-[var(--color-brand-500)]" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleTask(task.id)}
                                            className="flex-1 min-w-0 text-left"
                                        >
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
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteTask(task.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            aria-label="Eliminar tarea"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
