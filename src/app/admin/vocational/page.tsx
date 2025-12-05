"use client";

import { useState, useEffect } from "react";
import { Search, Eye, FileText } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Mock data for admin view
const MOCK_RESULTS = [
    { id: 1, student: "Miguel López", email: "miguel@example.com", date: "2025-12-05", primary: "Investigador", secondary: "Realista" },
    { id: 2, student: "Ana García", email: "ana@example.com", date: "2025-12-04", primary: "Artístico", secondary: "Emprendedor" },
    { id: 3, student: "Carlos Ruiz", email: "carlos@example.com", date: "2025-12-04", primary: "Social", secondary: "Investigador" },
];

export default function AdminVocationalPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredResults = MOCK_RESULTS.filter(r =>
        r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resultados Vocacionales</h1>
                    <p className="text-gray-500">Administración de perfiles RIASEC de estudiantes.</p>
                </div>
                <Button variant="outline">
                    <FileText size={18} className="mr-2" /> Exportar CSV
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
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
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Estudiante</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Perfil Principal</th>
                                <th className="px-6 py-4">Perfil Secundario</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredResults.map((result) => (
                                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{result.student}</div>
                                        <div className="text-gray-500 text-xs">{result.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{result.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {result.primary}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{result.secondary}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] font-medium text-sm inline-flex items-center gap-1">
                                            <Eye size={16} /> Ver Reporte
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredResults.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No se encontraron resultados para "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
