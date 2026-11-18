"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Eye, FileText, X, RefreshCw } from "lucide-react";
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

export default function AdminVocationalPage() {
    const [results, setResults] = useState<VocationalResultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResult, setSelectedResult] = useState<VocationalResultItem | null>(null);

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
        } catch {
            setErrorMessage("Error de conexión al consultar resultados RIASEC.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadResults();
    }, [loadResults]);

    const filteredResults = results.filter(
        (r) =>
            r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        const rows = [
            "Estudiante,Email,Fecha,Perfil Principal,Perfil Secundario",
            ...filteredResults.map(
                (r) => `"${r.student}","${r.email}",${r.date},"${r.primary}","${r.secondary}"`
            ),
        ];
        const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resultados-vocacionales-riasec.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Resultados Vocacionales</h1>
                    <p className="text-sm text-slate-500">Administración de perfiles RIASEC reales de estudiantes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadResults} disabled={loading}>
                        <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Actualizar
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV} disabled={filteredResults.length === 0}>
                        <FileText size={18} className="mr-2" /> Exportar CSV
                    </Button>
                </div>
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
                            placeholder="Buscar estudiante por nombre o correo..."
                            icon={<Search size={18} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                </div>

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
                                        {searchTerm
                                            ? `No se encontraron resultados para "${searchTerm}"`
                                            : "Ningún estudiante ha completado aún el Test Vocacional RIASEC."}
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
                                aria-label="Cerrar"
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
        </div>
    );
}
