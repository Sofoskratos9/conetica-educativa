import Link from "next/link";
import { Compass, ShieldCheck, MapPin, Mail, Phone } from "lucide-react";
import { NEFTALI_CAL_COM_URL, NEFTALI_SESSION } from "@/lib/neftali";

export function Footer() {
    return (
        <footer className="bg-[#EFE7D8] text-[#14532D] border-t-[3px] border-[#14532D]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#FBF8F1] border-2 border-[#14532D] flex items-center justify-center">
                                <Compass size={20} className="text-[var(--color-brand-600)]" />
                            </div>
                            <span className="font-bold text-lg text-[var(--color-brand-900)]">Conética Educativa</span>
                        </Link>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            Pensamiento aplicado a la vida real: estudio, vocación y decisiones.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs text-[#14532D] bg-[#FBF8F1] border border-[#14532D] px-3 py-1.5 rounded-lg">
                            <ShieldCheck size={14} />
                            <span>Servicio educativo (no clínico)</span>
                        </div>
                    </div>

                    {/* Plataforma */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-brand-900)] uppercase tracking-wider mb-4">
                            Plataforma
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/services" className="hover:text-[var(--color-brand-700)] transition-colors">Servicios y Mentoría</Link></li>
                            <li><Link href="/pricing" className="hover:text-[var(--color-brand-700)] transition-colors">Planes y Precios</Link></li>
                            <li><Link href="/schools" className="hover:text-[var(--color-brand-700)] transition-colors">Talleres para Escuelas</Link></li>
                            <li><Link href="/blog" className="hover:text-[var(--color-brand-700)] transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Legal y Ética */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-brand-900)] uppercase tracking-wider mb-4">
                            Ética y Legal
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/legal/ethics" className="hover:text-[var(--color-brand-700)] transition-colors">Declaración Ética</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-[var(--color-brand-700)] transition-colors">Aviso de Privacidad (LFPDPPP)</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-[var(--color-brand-700)] transition-colors">Términos de Uso</Link></li>
                            <li><Link href="/auth/login" className="hover:text-[var(--color-brand-700)] transition-colors">Acceso a Usuarios</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-brand-900)] uppercase tracking-wider mb-4">
                            Contacto
                        </h3>
                        <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                            <li className="flex items-center gap-2">
                                <MapPin size={16} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                <span>Aguascalientes, Ags., México</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={16} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                <a
                                    href="https://wa.me/5214494959259"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[var(--color-brand-700)] transition-colors"
                                >
                                    WhatsApp: 449 495 9259
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={16} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                <a
                                    href="mailto:contacto@coneticaeducativa.com"
                                    className="hover:text-[var(--color-brand-700)] transition-colors"
                                >
                                    contacto@coneticaeducativa.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Consultoría filosófica NEFTALÍ */}
                <div className="mt-12 pt-8 border-t border-[#14532D]/20 text-center">
                    <p className="text-sm font-bold text-[var(--color-brand-900)]">
                        Consultoría filosófica NEFTALÍ · {NEFTALI_SESSION.name}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {NEFTALI_SESSION.duration}, {NEFTALI_SESSION.priceLabel} {NEFTALI_SESSION.priceNote.toLowerCase()}. {NEFTALI_SESSION.cancellation}. {NEFTALI_SESSION.notTherapy}. {NEFTALI_SESSION.credentials}.{" "}
                        <a href={NEFTALI_CAL_COM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-brand-700)] underline underline-offset-2">
                            Agendar sesión
                        </a>
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-[#14532D]/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <p>© {new Date().getFullYear()} Conética Educativa. Todos los derechos reservados.</p>
                    <p>Metodología alineada a guías de CENEVAL EXANI-II y SEP.</p>
                </div>
            </div>
        </footer>
    );
}
