"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {

    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-8 border border-gray-200 shadow-xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
                <p className="text-gray-500 mb-8">
                    Bienvenido a <span className="font-bold text-[var(--color-brand-600)]">Conética Premium</span>. Tu suscripción ha sido activada correctamente.
                </p>

                <div className="bg-[var(--color-brand-50)] rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-bold text-[var(--color-brand-900)] mb-3 flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500 fill-yellow-500" /> Ahora tienes acceso a:
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[var(--color-brand-500)] rounded-full"></span>
                            Módulos avanzados de estudio
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[var(--color-brand-500)] rounded-full"></span>
                            Simuladores de examen ilimitados
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[var(--color-brand-500)] rounded-full"></span>
                            Soporte prioritario
                        </li>
                    </ul>
                </div>

                <Link href="/dashboard">
                    <Button className="w-full py-4 text-lg">
                        Ir a mi Dashboard <ArrowRight size={20} className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
