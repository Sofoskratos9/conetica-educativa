import Link from "next/link";
import { Heart, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function EthicsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-brand-600)] hover:underline mb-8">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="text-red-500" size={32} />
                        <h1 className="text-4xl font-bold text-gray-900">Declaración Ética del Proyecto</h1>
                    </div>

                    <p className="text-lg text-gray-600 mb-8">
                        En Conética Educativa™ creemos en la transparencia, la evidencia científica y el respeto absoluto por el bienestar de nuestros estudiantes.
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
                            <p className="text-gray-700">
                                Democratizar el acceso a estrategias de aprendizaje científicamente validadas, proporcionando herramientas educativas que empoderen a los estudiantes para alcanzar su máximo potencial académico de forma ética, transparente y respetuosa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Principios Éticos Fundamentales</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="font-bold text-gray-900">1. Método y honestidad</h3>
                                        <p className="text-gray-700">
                                            Nuestras metodologías se inspiran en investigación educativa y fuentes públicas (CENEVAL, SEP, OCDE, UNESCO, OMS). Los cuestionarios y simuladores de la plataforma son ejercicios de práctica y autoconocimiento, no instrumentos validados ni diagnósticos.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="font-bold text-gray-900">2. Transparencia Total</h3>
                                        <p className="text-gray-700">
                                            Explicamos claramente las bases científicas de cada estrategia. Los estudiantes y padres tienen derecho a conocer el &ldquo;por qué&rdquo; detrás de cada recomendación.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="font-bold text-gray-900">3. Respeto a la Autonomía</h3>
                                        <p className="text-gray-700">
                                            Los estudiantes son dueños de sus decisiones. Proporcionamos información y herramientas, no imponemos caminos. La orientación vocacional es educativa, no determinista.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="font-bold text-gray-900">4. Privacidad y Confidencialidad</h3>
                                        <p className="text-gray-700">
                                            Los datos de nuestros usuarios son sagrados. No vendemos, compartimos ni explotamos información personal. Cumplimos estrictamente con la LFPDPPP.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="font-bold text-gray-900">5. Accesibilidad e Inclusión</h3>
                                        <p className="text-gray-700">
                                            Ofrecemos un plan gratuito robusto. La educación de calidad no debe ser un privilegio exclusivo de quienes pueden pagar.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="font-bold text-gray-900">6. No Explotación Emocional</h3>
                                        <p className="text-gray-700">
                                            No utilizamos tácticas de miedo, presión o urgencia artificial. Nuestro marketing es honesto y respetuoso.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ACLARACIÓN NO CLÍNICA */}
                        <section className="bg-red-50 border-2 border-red-400 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Aclaración NO CLÍNICA</h2>
                                    <p className="text-gray-700 mb-3">
                                        <strong>Conética Educativa™ NO es un servicio de salud mental, psicológico ni médico.</strong>
                                    </p>

                                    <h3 className="font-bold text-gray-900 mb-2">Lo que SÍ somos:</h3>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-3">
                                        <li>Plataforma educativa de estrategias de aprendizaje</li>
                                        <li>Servicio de orientación vocacional educativa (no terapia)</li>
                                        <li>Herramienta de diagnóstico académico (no psicológico)</li>
                                        <li>Programa de técnicas de organización y autorregulación académica</li>
                                    </ul>

                                    <h3 className="font-bold text-gray-900 mb-2">Lo que NO somos:</h3>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-3">
                                        <li>Servicio de psicoterapia o consejería clínica</li>
                                        <li>Tratamiento para trastornos de salud mental</li>
                                        <li>Sustituto de atención médica o psicológica profesional</li>
                                        <li>Diagnóstico de condiciones psicológicas o neurológicas</li>
                                    </ul>

                                    <p className="text-gray-700 font-bold">
                                        Si experimenta ansiedad severa, depresión, crisis emocional o cualquier problema de salud mental, por favor consulte a un profesional de la salud mental licenciado. Podemos recomendarle recursos apropiados.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Límites Éticos de Nuestro Servicio</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>No prometemos resultados garantizados:</strong> El éxito académico depende de múltiples factores, incluyendo el esfuerzo personal del estudiante.</li>
                                <li><strong>No reemplazamos la educación formal:</strong> Somos un complemento, no un sustituto de la escuela o universidad.</li>
                                <li><strong>No diagnosticamos condiciones médicas:</strong> Nuestros diagnósticos son estrictamente académicos y cognitivos, no clínicos.</li>
                                <li><strong>No tomamos decisiones por el usuario:</strong> Proporcionamos información para que el estudiante tome decisiones informadas.</li>
                                <li><strong>No explotamos vulnerabilidades:</strong> Respetamos la situación emocional y económica de nuestros usuarios.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compromiso con la Mejora Continua</h2>
                            <p className="text-gray-700">
                                Nos comprometemos a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                                <li>Actualizar nuestras metodologías conforme avanza la investigación científica</li>
                                <li>Escuchar activamente el feedback de estudiantes y padres</li>
                                <li>Corregir errores de forma transparente y oportuna</li>
                                <li>Capacitar continuamente a nuestro equipo en ética educativa</li>
                                <li>Someternos a auditorías externas de calidad y ética</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fuentes Científicas</h2>
                            <p className="text-gray-700 mb-3">
                                Nos inspiramos en fuentes públicas como:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                <li>CENEVAL (Centro Nacional de Evaluación para la Educación Superior)</li>
                                <li>SEP (Secretaría de Educación Pública)</li>
                                <li>OCDE (Organización para la Cooperación y el Desarrollo Económicos)</li>
                                <li>UNESCO (Organización de las Naciones Unidas para la Educación)</li>
                                <li>OMS (Organización Mundial de la Salud) - solo para bienestar general</li>
                                <li>Publicaciones educativas sobre aprendizaje y estudio</li>
                            </ul>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Contacto Ético</h3>
                            <p className="text-gray-700">
                                Si tiene preocupaciones éticas sobre nuestro servicio o desea reportar una violación a estos principios:
                            </p>
                            <p className="text-gray-700 mt-2">
                                📧 Email: <strong>etica@coneticaeducativa.com</strong><br />
                                📍 Aguascalientes, México
                            </p>
                            <p className="text-gray-700 mt-3 text-sm">
                                Todas las quejas éticas son investigadas con seriedad y confidencialidad.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
