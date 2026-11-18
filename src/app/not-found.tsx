import Link from "next/link";
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="surface-card max-w-lg w-full p-8 sm:p-10 rounded-3xl text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl gradient-brand text-white flex items-center justify-center mx-auto shadow-lg">
                    <Compass size={32} className="text-emerald-400" />
                </div>
                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase">
                        Error 404
                    </span>
                    <h1 className="text-3xl font-extrabold text-[var(--color-brand-900)]">
                        Página no encontrada
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        La ruta que buscas no existe o fue movida. Puedes regresar al inicio o explorar nuestros programas académicos.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white text-sm font-semibold transition-colors"
                    >
                        <Home size={16} /> Ir al Inicio
                    </Link>
                    <Link
                        href="/services"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
                    >
                        <ArrowLeft size={16} /> Ver Servicios
                    </Link>
                </div>
            </div>
        </div>
    );
}
