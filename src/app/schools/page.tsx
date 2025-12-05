"use client";

import { useState } from "react";
import { WORKSHOPS } from "@/lib/schools-data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, Check, Send, Building2 } from "lucide-react";

export default function SchoolsPage() {
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        position: '',
        email: '',
        phone: '',
        interest: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[var(--color-brand-900)] to-[var(--color-brand-700)] text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                        <Building2 size={20} />
                        <span className="text-sm font-medium">Para Instituciones Educativas</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6">Talleres Transformadores para tu Colegio</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Programas basados en evidencia científica para desarrollar habilidades del siglo XXI en estudiantes y docentes.
                    </p>
                </div>
            </div>

            {/* Workshops Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Nuestros Talleres</h2>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {WORKSHOPS.map((workshop) => (
                        <div key={workshop.id} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`p-3 rounded-xl ${workshop.bg} ${workshop.color}`}>
                                    <workshop.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{workshop.title}</h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full ${workshop.bg} ${workshop.color} font-medium`}>
                                            {workshop.targetAudience}
                                        </span>
                                        <span className="text-gray-500">• {workshop.duration}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6">{workshop.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="text-sm font-bold text-gray-700 mb-3">Beneficios clave:</div>
                                {workshop.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <GraduationCap className="mx-auto mb-4 text-[var(--color-brand-600)]" size={48} />
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Solicita Información</h2>
                        <p className="text-gray-600">
                            Completa el formulario y nos pondremos en contacto contigo para diseñar una propuesta personalizada.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                            <Check size={48} className="text-green-600 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-green-900 mb-2">¡Solicitud Enviada!</h3>
                            <p className="text-green-700">Nos pondremos en contacto contigo en las próximas 24 horas.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Nombre Completo"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Nombre del Colegio"
                                    value={formData.school}
                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Cargo/Posición"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    placeholder="Ej: Director, Coordinador"
                                    required
                                />
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                label="Teléfono"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Taller de Interés
                                </label>
                                <select
                                    value={formData.interest}
                                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">Selecciona un taller</option>
                                    {WORKSHOPS.map((w) => (
                                        <option key={w.id} value={w.id}>{w.title}</option>
                                    ))}
                                    <option value="multiple">Varios talleres</option>
                                    <option value="custom">Propuesta personalizada</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full py-4 text-lg">
                                <Send size={20} className="mr-2" /> Enviar Solicitud
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
