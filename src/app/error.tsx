"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError]", error?.digest || error?.message);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="surface-card max-w-lg w-full p-8 sm:p-10 rounded-3xl text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-[var(--color-brand-900)]">
                        Algo salió mal al cargar esta vista
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Ocurrió un error inesperado. Puedes intentar recargar esta sección o regresar a la página principal.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white text-sm font-semibold transition-colors"
                    >
                        <RotateCcw size={16} /> Reintentar
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
                    >
                        <Home size={16} /> Ir al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
