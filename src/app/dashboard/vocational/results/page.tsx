"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiasecType, RIASEC_DESCRIPTIONS } from "@/lib/vocational-data";
import { TestResult } from "@/lib/vocational-logic";
import { Button } from "@/components/ui/Button";
import { ArrowRight, BookOpen, Briefcase, CheckCircle, RotateCcw } from "lucide-react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
} from "recharts";

export default function VocationalResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<TestResult | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("vocational_result");
        if (!stored) {
            router.push("/dashboard/vocational");
            return;
        }
        setResult(JSON.parse(stored));
    }, [router]);

    if (!result) return null;

    const primaryCode = result.topCodes[0];
    const profile = RIASEC_DESCRIPTIONS[primaryCode];
    const maxScore = 3;

    const radarData = (Object.entries(result.scores) as [RiasecType, number][]).map(([code, score]) => ({
        code: RIASEC_DESCRIPTIONS[code].title.split(" ")[0],
        porcentaje: Math.round((score / maxScore) * 100),
        fullMark: 100,
    }));

    return (
        <div className="space-y-8 pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="surface-card p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-xs font-bold uppercase tracking-wider mb-3">
                        Tu Perfil Vocacional RIASEC ({result.topCodes.join("-")})
                    </span>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)] mb-2">
                        Perfil Principal:{" "}
                        <span className="text-[var(--color-brand-600)]">{profile.title}</span>
                    </h1>
                    <p className="text-base text-slate-600 max-w-3xl">{profile.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {profile.keywords.map((kw) => (
                            <span
                                key={kw}
                                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                            >
                                #{kw}
                            </span>
                        ))}
                    </div>
                </div>
                <Link href="/dashboard/vocational/test">
                    <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                        <RotateCcw size={15} /> Repetir Test
                    </Button>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Radar + Breakdown */}
                <div className="lg:col-span-1 surface-card p-6 rounded-2xl space-y-6">
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Hexágono Holland (RIASEC)</h2>
                        <p className="text-xs text-slate-500">Visualización de tus 6 dimensiones vocacionales</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="code" tick={{ fontSize: 11, fill: "#334155" }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar
                                    name="Afinidad %"
                                    dataKey="porcentaje"
                                    stroke="#2563eb"
                                    fill="#10b981"
                                    fillOpacity={0.32}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        {(Object.entries(result.scores) as [RiasecType, number][])
                            .sort(([, a], [, b]) => b - a)
                            .map(([code, score]) => {
                                const percentage = Math.round((score / maxScore) * 100);
                                return (
                                    <div key={code}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-slate-700">
                                                {RIASEC_DESCRIPTIONS[code].title}
                                            </span>
                                            <span className="text-slate-500 font-bold">{percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    result.topCodes.includes(code)
                                                        ? "bg-[var(--color-brand-500)]"
                                                        : "bg-slate-300"
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Career Suggestions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-[var(--color-brand-900)] flex items-center gap-2">
                        <Briefcase className="text-[var(--color-brand-500)]" /> Carreras Compatibles
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {result.suggestedCareers.map((career) => (
                            <div
                                key={career.id}
                                className="surface-card p-5 rounded-2xl hover:border-[var(--color-brand-300)] group"
                            >
                                <div className="text-xs font-bold text-[var(--color-accent-600)] mb-1.5 uppercase tracking-wide">
                                    {career.area}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--color-brand-600)] transition-colors">
                                    {career.title}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1.5 mb-4">{career.description}</p>
                                <div className="flex gap-2">
                                    {career.codes.map((code) => (
                                        <span
                                            key={code}
                                            className={`text-xs font-mono px-2 py-0.5 rounded ${
                                                result.topCodes.includes(code)
                                                    ? "bg-emerald-100 text-emerald-800 font-bold"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                        <h3 className="font-bold text-[var(--color-brand-900)] flex items-center gap-2">
                            <BookOpen className="text-[var(--color-brand-500)]" /> Próximos Pasos Recomendados
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700 text-sm">
                                    Compara los planes de estudio de estas carreras en la UAA u otras universidades públicas y privadas.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700 text-sm">
                                    Agenda una sesión 1:1 de interpretación vocacional para profundizar en tus aptitudes.
                                </span>
                            </li>
                        </ul>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link href="/dashboard/booking/calendar?service=vocational">
                                <Button className="gap-2">
                                    Agendar Asesoría Vocacional <ArrowRight size={16} />
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="outline">Volver al Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
