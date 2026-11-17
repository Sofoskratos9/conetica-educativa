"use client";

import { useState } from "react";
import { Search, Eye, FileText, X } from "lucide-react";
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
    id: number;
    student: string;
    email: string;
    date: string;
    primary: string;
    secondary: string;
    scores: { area: string; value: number }[];
}

const MOCK_RESULTS: VocationalResultItem[] = [
    {
        id: 1,
        student: "Miguel López",
        email: "miguel@example.com",
        date: "2025-12-05",
        primary: "Investigador",
        secondary: "Realista",
        scores: [
            { area: "Realista", value: 78 },
            { area: "Investigador", value: 94 },
            { area: "Artístico", value: 52 },
            { area: "Social", value: 65 },
            { area: "Emprendedor", value: 60 },
            { area: "Convencional", value: 70 },
        ],
    },
    {
        id: 2,
        student: "Ana García",
        email: "ana@example.com",
        date: "2025-12-04",
        primary: "Artístico",
        secondary: "Emprendedor",
        scores: [
            { area: "Realista", value: 45 },
            { area: "Investigador", value: 68 },
            { area: "Artístico", value: 92 },
            { area: "Social", value: 74 },
            { area: "Emprendedor", value: 85 },
            { area: "Convencional", value: 48 },
        ],
    },
    {
        id: 3,
        student: "Carlos Ruiz",
        email: "carlos@example.com",
        date: "2025-12-04",
        primary: "Social",
        secondary: "Investigador",
        scores: [
            { area: "Realista", value: 50 },
            { area: "Investigador", value: 82 },
            { area: "Artístico", value: 64 },
            { area: "Social", value: 95 },
            { area: "Emprendedor", value: 71 },
            { area: "Convencional", value: 58 },
        ],
    },
];

export default function AdminVocationalPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResult, setSelectedResult] = useState<VocationalResultItem | null>(null);

    const filteredResults = MOCK_RESULTS.filter(
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
                    <p className="text-sm text-slate-500">Administración de perfiles RIASEC de estudiantes.</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                    <FileText size={18} className="mr-2" /> Exportar CSV
                </Button>
            </div>

            <div className="surface-card overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="max-w-md">
                        <Input
                            placeholder="Buscar estudiante..."
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
                            {filteredResults.map((result) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredResults.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No se encontraron resultados para &ldquo;{searchTerm}&rdquo;
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
