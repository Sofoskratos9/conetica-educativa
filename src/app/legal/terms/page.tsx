import Link from "next/link";
import { FileText, ArrowLeft, AlertTriangle } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-brand-600)] hover:underline mb-8">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="text-[var(--color-brand-600)]" size={32} />
                        <h1 className="text-4xl font-bold text-gray-900">Términos de Uso</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">Última actualización: Diciembre 2025</p>

                    {/* ACLARACIÓN NO CLÍNICA - DESTACADA */}
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ ACLARACIÓN IMPORTANTE - SERVICIO NO CLÍNICO</h3>
                                <p className="text-gray-700 mb-2">
                                    <strong>Conética Educativa™ NO es un servicio de salud mental ni clínico.</strong> Somos una plataforma educativa que ofrece:
                                </p>
                                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                    <li>Estrategias de aprendizaje basadas en evidencia científica</li>
                                    <li>Diagnósticos académicos (NO psicológicos ni médicos)</li>
                                    <li>Orientación vocacional educativa (NO terapia)</li>
                                    <li>Técnicas de organización y autorregulación académica</li>
                                </ul>
                                <p className="text-gray-700 mt-3 font-bold">
                                    Si experimenta problemas de salud mental, ansiedad severa, depresión o cualquier condición clínica, consulte a un profesional de la salud licenciado.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de Términos</h2>
                            <p className="text-gray-700">
                                Al acceder y utilizar Conética Educativa™, usted acepta estar sujeto a estos Términos de Uso. Si no está de acuerdo, no utilice la plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
                            <p className="text-gray-700">
                                Conética Educativa™ es una plataforma educativa que proporciona:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Diagnósticos cognitivo-académicos (NO clínicos)</li>
                                <li>Planes de estudio personalizados</li>
                                <li>Preparación para exámenes de admisión</li>
                                <li>Orientación vocacional educativa</li>
                                <li>Estrategias de aprendizaje y organización</li>
                                <li>Mentoría académica individual</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Límites de Uso</h2>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3.1 Uso Permitido</h3>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Uso personal y educativo</li>
                                <li>Acceso desde un máximo de 3 dispositivos simultáneos</li>
                                <li>Compartir progreso con padres/tutores autorizados</li>
                            </ul>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">3.2 Uso Prohibido</h3>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Compartir credenciales de acceso con terceros</li>
                                <li>Copiar, distribuir o revender contenido de la plataforma</li>
                                <li>Utilizar la plataforma para fines comerciales sin autorización</li>
                                <li>Realizar ingeniería inversa del software</li>
                                <li>Automatizar accesos mediante bots o scripts</li>
                                <li>Utilizar la plataforma como sustituto de atención médica o psicológica</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Derechos del Usuario</h2>
                            <p className="text-gray-700 mb-3">Como usuario de Conética Educativa™, usted tiene derecho a:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Acceso:</strong> Utilizar todos los servicios incluidos en su plan</li>
                                <li><strong>Privacidad:</strong> Protección de sus datos personales según nuestro Aviso de Privacidad</li>
                                <li><strong>Cancelación:</strong> Cancelar su suscripción en cualquier momento sin penalización</li>
                                <li><strong>Reembolso:</strong> Solicitar reembolso dentro de los primeros 7 días (según política)</li>
                                <li><strong>Soporte:</strong> Recibir asistencia técnica y educativa</li>
                                <li><strong>Transparencia:</strong> Conocer las bases científicas de nuestras metodologías</li>
                                <li><strong>Portabilidad:</strong> Exportar sus datos y resultados</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Responsabilidades del Usuario</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Proporcionar información veraz y actualizada</li>
                                <li>Mantener la confidencialidad de sus credenciales</li>
                                <li>Utilizar la plataforma de forma ética y legal</li>
                                <li>Notificar cualquier uso no autorizado de su cuenta</li>
                                <li>Reconocer que los resultados dependen de su esfuerzo personal</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
                            <p className="text-gray-700">
                                Todo el contenido de Conética Educativa™ (textos, gráficos, logos, software, metodologías) está protegido por derechos de autor y propiedad intelectual. El usuario obtiene una licencia limitada, no exclusiva y no transferible para uso personal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
                            <p className="text-gray-700 mb-3">
                                Conética Educativa™ NO se hace responsable de:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Resultados de admisión universitaria (dependen de múltiples factores)</li>
                                <li>Decisiones vocacionales o profesionales del usuario</li>
                                <li>Problemas de salud mental o emocionales (NO somos servicio clínico)</li>
                                <li>Interrupciones del servicio por mantenimiento o causas de fuerza mayor</li>
                                <li>Pérdida de datos por fallas técnicas (realizamos respaldos regulares)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modificaciones del Servicio</h2>
                            <p className="text-gray-700">
                                Nos reservamos el derecho de modificar, suspender o descontinuar cualquier aspecto de la plataforma con previo aviso de 30 días.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Terminación</h2>
                            <p className="text-gray-700">
                                Podemos suspender o terminar su acceso si viola estos términos. Usted puede cancelar su cuenta en cualquier momento desde la configuración de su perfil.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Ley Aplicable</h2>
                            <p className="text-gray-700">
                                Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta en los tribunales de Aguascalientes, México.
                            </p>
                        </section>

                        <section className="bg-green-50 p-6 rounded-xl border border-green-200 mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Contacto Legal</h3>
                            <p className="text-gray-700">
                                Para consultas sobre estos términos:
                            </p>
                            <p className="text-gray-700 mt-2">
                                📧 Email: <strong>legal@coneticaeducativa.com</strong><br />
                                📍 Aguascalientes, México
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
