"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiasecType, RIASEC_DESCRIPTIONS, Career } from "@/lib/vocational-data";
import { TestResult } from "@/lib/vocational-logic";
import { Button } from "@/components/ui/Button";
import { ArrowRight, BookOpen, Briefcase, CheckCircle } from "lucide-react";

export default function VocationalResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<TestResult | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('vocational_result');
        if (!stored) {
            router.push('/dashboard/vocational');
            return;
        }
        setResult(JSON.parse(stored));
    }, [router]);

    if (!result) return null;

    const primaryCode = result.topCodes[0];
    const profile = RIASEC_DESCRIPTIONS[primaryCode];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-sm font-bold mb-4">
                    Tu Perfil Vocacional
                </span>
                <h1 className="text-3xl font-bold text-[var(--color-brand-900)] mb-2">
                    Eres principalmente <span className="text-[var(--color-brand-600)]">{profile.title}</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                    {profile.description}
                </p>
                <div className="flex gap-2 mt-4">
                    {profile.keywords.map(kw => (
                        <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                            #{kw}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Chart / Breakdown */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Desglose RIASEC</h3>
                    <div className="space-y-4">
                        {(Object.entries(result.scores) as [RiasecType, number][])
                            .sort(([, a], [, b]) => b - a)
                            .map(([code, score]) => {
                                const maxScore = 3; // Based on 3 questions per type in our mini-test
                                const percentage = (score / maxScore) * 100;
                                return (
                                    <div key={code}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{RIASEC_DESCRIPTIONS[code].title}</span>
                                            <span className="text-gray-500">{Math.round(percentage)}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${result.topCodes.includes(code) ? 'bg-[var(--color-brand-500)]' : 'bg-gray-300'}`}
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
                    <h3 className="text-xl font-bold text-[var(--color-brand-900)] flex items-center gap-2">
                        <Briefcase className="text-[var(--color-brand-500)]" /> Carreras Sugeridas
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        {result.suggestedCareers.map(career => (
                            <div key={career.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[var(--color-brand-300)] hover:shadow-md transition-all group">
                                <div className="text-xs font-bold text-[var(--color-accent-500)] mb-2 uppercase tracking-wide">
                                    {career.area}
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-brand-600)] transition-colors">
                                    {career.title}
                                </h4>
                                <p className="text-sm text-gray-500 mt-2 mb-4">
                                    {career.description}
                                </p>
                                <div className="flex gap-2">
                                    {career.codes.map(code => (
                                        <span key={code} className={`text-xs font-mono px-2 py-0.5 rounded ${result.topCodes.includes(code) ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Next Steps */}
                    <div className="bg-[var(--color-surface-50)] p-6 rounded-xl border border-[var(--color-brand-100)]">
                        <h3 className="font-bold text-[var(--color-brand-900)] mb-4 flex items-center gap-2">
                            <BookOpen className="text-[var(--color-brand-500)]" /> Próximos Pasos Recomendados
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-500 mt-0.5" />
                                <span className="text-gray-700 text-sm">Investiga los planes de estudio de las carreras sugeridas en la UAA u otras universidades.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-500 mt-0.5" />
                                <span className="text-gray-700 text-sm">Habla con profesionales que trabajen en estas áreas (podemos ayudarte a contactarlos).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-500 mt-0.5" />
                                <span className="text-gray-700 text-sm">Agenda una sesión de mentoría personalizada para profundizar en tu perfil.</span>
                            </li>
                        </ul>
                        <div className="mt-6">
                            <Link href="/dashboard">
                                <Button variant="secondary" className="w-full sm:w-auto">
                                    Volver al Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
