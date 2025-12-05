"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QUESTIONS } from "@/lib/vocational-data";
import { calculateRiasecScore, getTopCodes, getSuggestedCareers } from "@/lib/vocational-logic";

export default function VocationalTestPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const question = QUESTIONS[currentStep];
    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

    const handleAnswer = (value: boolean) => {
        const newAnswers = { ...answers, [question.id]: value };
        setAnswers(newAnswers);

        if (currentStep < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 200);
        } else {
            finishTest(newAnswers);
        }
    };

    const finishTest = async (finalAnswers: Record<string, boolean>) => {
        setIsSubmitting(true);

        // Calculate results
        const scores = calculateRiasecScore(finalAnswers, QUESTIONS);
        const topCodes = getTopCodes(scores);
        const suggestedCareers = getSuggestedCareers(topCodes);

        // Simulate saving to DB (localStorage for demo)
        const resultData = {
            date: new Date().toISOString(),
            scores,
            topCodes,
            suggestedCareers
        };

        localStorage.setItem('vocational_result', JSON.stringify(resultData));

        // Simulate network delay
        setTimeout(() => {
            router.push('/dashboard/vocational/results');
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--color-brand-500)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[300px] flex flex-col justify-center text-center"
            >
                <h2 className="text-2xl font-bold text-[var(--color-brand-900)] mb-8">
                    {question.text}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleAnswer(false)}
                        className="p-4 rounded-xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 text-gray-600 font-medium transition-all"
                    >
                        No me interesa
                    </button>
                    <button
                        onClick={() => handleAnswer(true)}
                        className="p-4 rounded-xl border-2 border-[var(--color-brand-100)] bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] text-[var(--color-brand-700)] font-bold transition-all"
                    >
                        Sí, me interesa
                    </button>
                </div>
            </motion.div>

            {/* Navigation (Back) */}
            <div className="mt-6 flex justify-start">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-0 flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Anterior
                </button>
            </div>

            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-[var(--color-brand-200)] border-t-[var(--color-brand-600)] rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-[var(--color-brand-900)]">Analizando tu perfil...</h3>
                    <p className="text-gray-500">Buscando coincidencias científicas.</p>
                </div>
            )}
        </div>
    );
}
