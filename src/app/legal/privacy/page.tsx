import Link from "next/link";
import { Shield, FileText, Heart, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-brand-600)] hover:underline mb-8">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-[var(--color-brand-600)]" size={32} />
                        <h1 className="text-4xl font-bold text-gray-900">Aviso de Privacidad</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">Última actualización: Diciembre 2025</p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Responsable del Tratamiento de Datos</h2>
                            <p className="text-gray-700">
                                <strong>Conética Educativa™</strong>, con domicilio en Aguascalientes, México, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datos Personales Recabados</h2>
                            <p className="text-gray-700 mb-3">Recabamos los siguientes datos personales:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Identificación:</strong> Nombre completo, edad, correo electrónico</li>
                                <li><strong>Contacto:</strong> Número telefónico, dirección (opcional)</li>
                                <li><strong>Académicos:</strong> Institución educativa, nivel de estudios, áreas de interés</li>
                                <li><strong>Evaluaciones:</strong> Resultados de diagnósticos cognitivos y académicos</li>
                                <li><strong>Uso de plataforma:</strong> Progreso en módulos, tiempo de estudio, preferencias</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalidades del Tratamiento</h2>
                            <p className="text-gray-700 mb-3">Sus datos personales serán utilizados para:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Proporcionar servicios educativos personalizados</li>
                                <li>Generar diagnósticos y planes de estudio adaptados</li>
                                <li>Enviar comunicaciones educativas (con su consentimiento)</li>
                                <li>Mejorar nuestros servicios mediante análisis estadísticos</li>
                                <li>Cumplir obligaciones legales y fiscales</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartición de Datos</h2>
                            <p className="text-gray-700">
                                <strong>NO compartimos, vendemos ni transferimos</strong> sus datos personales a terceros, excepto:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                                <li>Cuando sea requerido por autoridades competentes</li>
                                <li>Con proveedores de servicios tecnológicos bajo acuerdos de confidencialidad</li>
                                <li>Con su consentimiento expreso</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Derechos ARCO</h2>
                            <p className="text-gray-700 mb-3">Usted tiene derecho a:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Acceder</strong> a sus datos personales</li>
                                <li><strong>Rectificar</strong> datos inexactos o incompletos</li>
                                <li><strong>Cancelar</strong> sus datos cuando considere que no se requieren</li>
                                <li><strong>Oponerse</strong> al tratamiento de sus datos para fines específicos</li>
                            </ul>
                            <p className="text-gray-700 mt-3">
                                Para ejercer estos derechos, contacte a: <strong>privacidad@coneticaeducativa.com</strong>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seguridad de Datos</h2>
                            <p className="text-gray-700">
                                Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies y Tecnologías de Rastreo</h2>
                            <p className="text-gray-700">
                                Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma. No utilizamos cookies de terceros para publicidad o rastreo sin su consentimiento.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Menores de Edad</h2>
                            <p className="text-gray-700">
                                Para usuarios menores de 18 años, requerimos el consentimiento de un padre o tutor legal. Los datos de menores son tratados con especial cuidado y protección.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cambios al Aviso de Privacidad</h2>
                            <p className="text-gray-700">
                                Nos reservamos el derecho de modificar este aviso. Los cambios serán notificados a través de la plataforma o por correo electrónico.
                            </p>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Contacto</h3>
                            <p className="text-gray-700">
                                Para cualquier duda sobre el tratamiento de sus datos personales, contacte a nuestro Departamento de Privacidad:
                            </p>
                            <p className="text-gray-700 mt-2">
                                📧 Email: <strong>privacidad@coneticaeducativa.com</strong><br />
                                📍 Aguascalientes, México
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
