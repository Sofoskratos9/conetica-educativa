"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Eye, FileText, X, RefreshCw, Brain } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

interface VocationalResultItem {
    id: string;
    student: string;
    email: string;
    date: string;
    primary: string;
    secondary: string;
    scores: { area: string; value: number }[];
}

interface PsychometricAdminItem {
    id: string;
    student: string;
    email: string;
    testId: string;
    testName: string;
    date: string;
    globalPercentage: number;
    topDimension: string;
    dimensions: {
        dimension: string;
        label: string;
        percentage: number;
        level: "alto" | "medio" | "bajo";
        interpretation: string;
    }[];
}

export default function AdminVocationalPage() {
    const [tab, setTab] = useState<"riasec" | "psychometrics">("riasec");
    const [results, setResults] = useState<VocationalResultItem[]>([]);
    const [psychoResults, setPsychoResults] = useState<PsychometricAdminItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResult, setSelectedResult] = useState<VocationalResultItem | null>(null);
    const [selectedPsycho, setSelectedPsycho] = useState<PsychometricAdminItem | null>(null);

    const loadResults = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/admin/overview");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudieron cargar los resultados.");
                return;
            }
            setResults(data.vocationalResults || []);
            setPsychoResults(data.psychometricResults || []);
        } catch {
            setErrorMessage("Error de conexión al consultar resultados.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadResults();
    }, [loadResults]);

    const q = searchTerm.toLowerCase();
    const filteredResults = results.filter(
        (r) => r.student.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
    const filteredPsycho = psychoResults.filter(
        (p) =>
            p.student.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.testName.toLowerCase().includes(q)
    );

    const handleExportCSV = () => {
        const rows =
            tab === "riasec"
                ? [
                      "Estudiante,Email,Fecha,Perfil Principal,Perfil Secundario",
                      ...filteredResults.map(
                          (r) => `"${r.student}","${r.email}",${r.date},"${r.primary}","${r.secondary}"`
                      ),
                  ]
                : [
                      "Estudiante,Email,Fecha,Instrumento,Indice Global (%),Dimension Principal",
                      ...filteredPsycho.map(
                          (p) =>
                              `"${p.student}","${p.email}",${p.date},"${p.testName}",${p.globalPercentage},"${p.topDimension}"`
                      ),
                  ];

        const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = tab === "riasec" ? "resultados-riasec.csv" : "resultados-psicometria.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Psicometría y Orientación Vocacional
                    </h1>
                    <p className="text-sm text-slate-500">
                        Perfiles RIASEC y cuestionarios de autoconocimiento (EDAOM, VAK, CHASIDE, Bar-On) en tiempo real.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadResults} disabled={loading}>
                        <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Actualizar
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV}>
                        <FileText size={18} className="mr-2" /> Exportar CSV
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setTab("riasec")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        tab === "riasec"
                            ? "bg-[var(--color-brand-600)] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    Perfiles Vocacionales RIASEC ({results.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab("psychometrics")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
                        tab === "psychometrics"
                            ? "bg-[var(--color-brand-600)] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    <Brain size={15} /> Evaluaciones Psicométricas ({psychoResults.length})
                </button>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            <div className="surface-card overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="max-w-md">
                        <Input
                            placeholder="Buscar por nombre, correo o instrumento..."
                            icon={<Search size={18} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                </div>

                {tab === "riasec" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Estudiante</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Perfil Principal</th>
                                    <th className="px-6 py-4">Perfil Secundario</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                            Cargando perfiles RIASEC...
                                        </td>
                                    </tr>
                                ) : filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            Ningún estudiante ha completado aún el Test Vocacional RIASEC.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((result) => (
                                        <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{result.student}</div>
                                                <div className="text-slate-500 text-xs">{result.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{result.date}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    {result.primary}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{result.secondary}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedResult(result)}
                                                    className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] font-semibold text-sm inline-flex items-center gap-1"
                                                >
                                                    <Eye size={16} /> Ver Reporte
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Estudiante</th>
                                    <th className="px-6 py-4">Instrumento</th>
                                    <th className="px-6 py-4">Dimensión Principal</th>
                                    <th className="px-6 py-4">Índice Global</th>
                                    <th className="px-6 py-4 text-right">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                            Cargando evaluaciones psicométricas...
                                        </td>
                                    </tr>
                                ) : filteredPsycho.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            Ningún estudiante ha completado evaluaciones psicométricas todavía.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPsycho.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{p.student}</div>
                                                <div className="text-xs text-slate-500">{p.email} · {p.date}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{p.testName}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                    {p.topDimension}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{p.globalPercentage}%</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPsycho(p)}
                                                    className="text-[var(--color-brand-600)] font-semibold text-sm inline-flex items-center gap-1 hover:underline"
                                                >
                                                    <Eye size={16} /> Ver Dimensiones
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedResult && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Perfil RIASEC: {selectedResult.student}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Principal: {selectedResult.primary} · Secundario: {selectedResult.secondary}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedResult(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={selectedResult.scores}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="area" tick={{ fontSize: 12, fill: "#334155" }} />
                                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                    <Tooltip formatter={(v) => [`${v ?? 0}%`, "Afinidad"]} />
                                    <Radar
                                        name={selectedResult.student}
                                        dataKey="value"
                                        stroke="#2563eb"
                                        fill="#2563eb"
                                        fillOpacity={0.35}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {selectedPsycho && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{selectedPsycho.testName}</h2>
                                <p className="text-xs text-slate-500">
                                    {selectedPsycho.student} · Índice Global: {selectedPsycho.globalPercentage}%
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedPsycho(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="h-60 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={selectedPsycho.dimensions} margin={{ left: -15, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#475569" }} />
                                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [`${v ?? 0}%`, "Nivel"]} />
                                    <Bar dataKey="percentage" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2">
                            {selectedPsycho.dimensions.map((d) => (
                                <div key={d.dimension} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                    <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                                        <span>{d.label}</span>
                                        <span>{d.percentage}% ({d.level.toUpperCase()})</span>
                                    </div>
                                    <p className="text-slate-600">{d.interpretation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
