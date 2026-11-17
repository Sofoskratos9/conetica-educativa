import Link from "next/link";
import { Compass, ShieldCheck, MapPin, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[var(--color-brand-900)] text-slate-300 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                                <Compass size={20} className="text-emerald-400" />
                            </div>
                            <span className="font-bold text-lg text-white">Conética Educativa™</span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Estrategias de aprendizaje, diagnóstico académico y orientación vocacional basados en evidencia científica.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
                            <ShieldCheck size={14} />
                            <span>Servicio educativo (no clínico)</span>
                        </div>
                    </div>

                    {/* Plataforma */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                            Plataforma
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/services" className="hover:text-white transition-colors">Servicios y Mentoría</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Planes y Precios</Link></li>
                            <li><Link href="/schools" className="hover:text-white transition-colors">Talleres para Escuelas</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog Científico</Link></li>
                        </ul>
                    </div>

                    {/* Legal y Ética */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                            Ética y Legal
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/legal/ethics" className="hover:text-white transition-colors">Declaración Ética</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Aviso de Privacidad (LFPDPPP)</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Términos de Uso</Link></li>
                            <li><Link href="/auth/login" className="hover:text-white transition-colors">Acceso a Usuarios</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                            Contacto
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-2">
                                <MapPin size={16} className="text-emerald-400 flex-shrink-0" />
                                <span>Aguascalientes, Ags., México</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={16} className="text-emerald-400 flex-shrink-0" />
                                <span>contacto@coneticaeducativa.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Conética Educativa™. Todos los derechos reservados.</p>
                    <p>Metodología alineada a CENEVAL EXANI-II, SEP, OCDE y UNESCO.</p>
                </div>
            </div>
        </footer>
    );
}
