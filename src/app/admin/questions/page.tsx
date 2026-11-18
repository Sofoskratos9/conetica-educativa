"use client";

import { useCallback, useEffect, useState } from "react";
import { EXANI_QUESTIONS, type ExaniArea, type ExaniQuestion } from "@/lib/exani-data";
import { Button } from "@/components/ui/Button";
import {
    GraduationCap,
    Plus,
    Trash2,
    Edit,
    RefreshCw,
    X,
    CheckCircle2,
    Filter,
} from "lucide-react";

interface CustomQuestionRecord extends ExaniQuestion {
    active: boolean;
    createdAt: string;
}

const AREAS: ExaniArea[] = [
    "Comprensión Lectora",
    "Pensamiento Matemático",
    "Pensamiento Analítico",
    "Estructura de la Lengua",
];

export default function AdminQuestionsPage() {
    const [customQuestions, setCustomQuestions] = useState<CustomQuestionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [areaFilter, setAreaFilter] = useState<"Todas" | ExaniArea>("Todas");
    const [sourceFilter, setSourceFilter] = useState<"all" | "custom" | "base">("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formArea, setFormArea] = useState<ExaniArea>("Pensamiento Matemático");
    const [formDifficulty, setFormDifficulty] = useState<"Básico" | "Intermedio" | "Avanzado">("Intermedio");
    const [formQuestion, setFormQuestion] = useState("");
    const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
    const [formCorrectIndex, setFormCorrectIndex] = useState(0);
    const [formExplanation, setFormExplanation] = useState("");

    const loadBank = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/admin/questions");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo cargar el banco de reactivos.");
                return;
            }
            setCustomQuestions(data.customQuestions || []);
        } catch {
            setErrorMessage("Error de conexión al consultar el banco EXANI-II.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBank();
    }, [loadBank]);

    const openCreate = () => {
        setEditingId(null);
        setFormArea("Pensamiento Matemático");
        setFormDifficulty("Intermedio");
        setFormQuestion("");
        setFormOptions(["", "", "", ""]);
        setFormCorrectIndex(0);
        setFormExplanation("");
        setModalOpen(true);
    };

    const openEdit = (q: CustomQuestionRecord) => {
        setEditingId(q.id);
        setFormArea(q.area);
        setFormDifficulty(q.difficulty);
        setFormQuestion(q.question);
        setFormOptions(q.options.length === 4 ? q.options : ["", "", "", ""]);
        setFormCorrectIndex(q.correctIndex);
        setFormExplanation(q.explanation);
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const method = editingId ? "PATCH" : "POST";
            const payload = {
                ...(editingId ? { id: editingId } : {}),
                area: formArea,
                difficulty: formDifficulty,
                question: formQuestion.trim(),
                options: formOptions.map((o) => o.trim()),
                correctIndex: formCorrectIndex,
                explanation: formExplanation.trim(),
            };
            const res = await fetch("/api/admin/questions", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo guardar el reactivo.");
                return;
            }
            setModalOpen(false);
            setSuccessMessage(
                editingId
                    ? "Reactivo actualizado. Los estudiantes ya ven los cambios."
                    : "Nuevo reactivo publicado directamente en el Simulador EXANI-II."
            );
            await loadBank();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setErrorMessage("");
        setSuccessMessage("");
        const res = await fetch(`/api/admin/questions?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setErrorMessage(data.error || "No se pudo eliminar el reactivo.");
            return;
        }
        setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
        setSuccessMessage("Reactivo personalizado eliminado.");
    };

    const mergedList = [
        ...customQuestions.map((q) => ({ ...q, source: "custom" as const })),
        ...EXANI_QUESTIONS.map((q) => ({ ...q, source: "base" as const, active: true })),
    ].filter((q) => {
        const areaOk = areaFilter === "Todas" || q.area === areaFilter;
        const sourceOk = sourceFilter === "all" || q.source === sourceFilter;
        return areaOk && sourceOk;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="text-[var(--color-brand-600)]" /> Banco EXANI-II y Reactivos
                    </h1>
                    <p className="text-sm text-slate-500">
                        50 reactivos base importados de MiguelBot- más tus reactivos personalizados guardados en Postgres.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadBank} disabled={loading}>
                        <RefreshCw size={15} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
                    </Button>
                    <Button onClick={openCreate} className="gap-1.5">
                        <Plus size={16} /> Nuevo Reactivo
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} /> {successMessage}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Total Activos en Simulador</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                        {EXANI_QUESTIONS.length + customQuestions.filter((q) => q.active).length}
                    </div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Banco Curado Base</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">{EXANI_QUESTIONS.length}</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Personalizados (Postgres)</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{customQuestions.length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="surface-card p-4 flex flex-wrap items-center gap-3">
                <Filter size={16} className="text-slate-400" />
                <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value as any)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    aria-label="Filtrar por área"
                >
                    <option value="Todas">Todas las áreas ({EXANI_QUESTIONS.length + customQuestions.length})</option>
                    {AREAS.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))}
                </select>
                <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as any)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    aria-label="Filtrar por origen"
                >
                    <option value="all">Base + Personalizados</option>
                    <option value="custom">Solo Personalizados ({customQuestions.length})</option>
                    <option value="base">Solo Banco Base ({EXANI_QUESTIONS.length})</option>
                </select>
            </div>

            {/* Question List */}
            <div className="space-y-3">
                {mergedList.map((q, idx) => (
                    <div key={q.id} className="surface-card p-5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-slate-400">#{idx + 1}</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                                    {q.area}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                    {q.difficulty}
                                </span>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full font-semibold ${
                                        q.source === "custom"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-indigo-50 text-indigo-700"
                                    }`}
                                >
                                    {q.source === "custom" ? "Personalizado (DB)" : "Banco Base"}
                                </span>
                            </div>

                            {q.source === "custom" && (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(q as CustomQuestionRecord)}
                                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                                        title="Editar reactivo"
                                    >
                                        <Edit size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(q.id)}
                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                        title="Eliminar reactivo"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="text-sm font-semibold text-slate-900">{q.question}</p>

                        <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                            {q.options.map((opt, optIdx) => (
                                <div
                                    key={optIdx}
                                    className={`px-3 py-1.5 rounded-lg border ${
                                        optIdx === q.correctIndex
                                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                            : "bg-slate-50 border-slate-200 text-slate-600"
                                    }`}
                                >
                                    <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-slate-500">
                            <strong>Explicación:</strong> {q.explanation}
                        </p>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSave}
                        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingId ? "Editar Reactivo EXANI-II" : "Crear Reactivo EXANI-II"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                                <select
                                    value={formArea}
                                    onChange={(e) => setFormArea(e.target.value as ExaniArea)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                                >
                                    {AREAS.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dificultad</label>
                                <select
                                    value={formDifficulty}
                                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                                >
                                    <option value="Básico">Básico</option>
                                    <option value="Intermedio">Intermedio</option>
                                    <option value="Avanzado">Avanzado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Enunciado</label>
                            <textarea
                                required
                                minLength={8}
                                rows={3}
                                value={formQuestion}
                                onChange={(e) => setFormQuestion(e.target.value)}
                                placeholder="Escribe el planteamiento del reactivo..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Opciones (marca cuál es la respuesta correcta)
                            </label>
                            {formOptions.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correctIndex"
                                        checked={formCorrectIndex === idx}
                                        onChange={() => setFormCorrectIndex(idx)}
                                        aria-label={`Marcar opción ${String.fromCharCode(65 + idx)} como correcta`}
                                    />
                                    <span className="text-xs font-bold w-5">{String.fromCharCode(65 + idx)}.</span>
                                    <input
                                        type="text"
                                        required
                                        value={opt}
                                        onChange={(e) => {
                                            const copy = [...formOptions];
                                            copy[idx] = e.target.value;
                                            setFormOptions(copy);
                                        }}
                                        placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Explicación Pedagógica
                            </label>
                            <textarea
                                required
                                minLength={8}
                                rows={2}
                                value={formExplanation}
                                onChange={(e) => setFormExplanation(e.target.value)}
                                placeholder="Explica paso a paso por qué esa es la respuesta correcta..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Guardar Reactivo"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
