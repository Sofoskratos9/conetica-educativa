"use client";

import { useState } from "react";
import { WORKSHOPS } from "@/lib/schools-data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, Check, Send, Building2, AlertCircle } from "lucide-react";

export default function SchoolsPage() {
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        position: "",
        email: "",
        phone: "",
        interest: "",
    });
    const [submittedRef, setSubmittedRef] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/schools/inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error || "No se pudo enviar la solicitud.");
                setIsSubmitting(false);
                return;
            }
            setSubmittedRef(data.referenceId);
            setFormData({ name: "", school: "", position: "", email: "", phone: "", interest: "" });
        } catch {
            setError("Error de red al enviar la solicitud.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)]">
            {/* Hero Section — fondo crema (SISTEMA-VISUAL.md §5). */}
            <div className="bg-[var(--color-surface-50)] py-20 px-4 border-b-[3px] border-[#14532D]">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 space-y-5">
                        <div className="inline-flex items-center gap-2 bg-[#EFE7D8] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">
                            <Building2 size={16} />
                            <span>Para Instituciones Educativas</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-brand-900)]">
                            Talleres para pensar bien en tu colegio
                        </h1>
                        <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl">
                            Programas para fortalecer el pensamiento crítico, el proyecto de vida y el uso responsable de la IA en estudiantes y docentes.
                        </p>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="rounded-[12px] overflow-hidden border-2 border-[#14532D] shadow-lg max-w-sm mx-auto">
                            <img
                                src="/images/neftali/planta.png"
                                alt="Ilustración dibujada a mano: un joven regando una plantita, símbolo de crecimiento"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Workshops Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Nuestros Talleres</h2>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {WORKSHOPS.map((workshop) => (
                        <div key={workshop.id} className="surface-card rounded-2xl p-8">
                            <div className="flex items-start gap-4 mb-5">
                                <div className={`p-3 rounded-xl ${workshop.bg} ${workshop.color}`}>
                                    <workshop.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{workshop.title}</h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span
                                            className={`px-3 py-1 rounded-full ${workshop.bg} ${workshop.color} font-semibold text-xs`}
                                        >
                                            {workshop.targetAudience}
                                        </span>
                                        <span className="text-slate-500">• {workshop.duration}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 mb-6">{workshop.description}</p>

                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Beneficios clave
                                </div>
                                {workshop.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                        <Check size={16} className="text-[var(--color-accent-600)] flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="surface-card rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <GraduationCap className="mx-auto mb-3 text-[var(--color-brand-600)]" size={44} />
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Solicita una Propuesta</h2>
                        <p className="text-slate-600">
                            Completa el formulario y diseñaremos un programa a la medida de tu institución.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {submittedRef ? (
                        <div className="bg-[#EFE7D8] border-2 border-[#14532D] rounded-[12px] p-8 text-center space-y-3">
                            <Check size={44} className="text-[var(--color-brand-600)] mx-auto" />
                            <h3 className="text-xl font-bold text-[var(--color-brand-900)]">¡Solicitud Registrada!</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Folio de seguimiento: <strong className="font-mono">{submittedRef}</strong>. Nos pondremos en contacto en menos de 24 horas hábiles.
                            </p>
                            <Button variant="outline" size="sm" onClick={() => setSubmittedRef(null)}>
                                Enviar otra consulta
                            </Button>
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
                                    label="Nombre del Colegio o Institución"
                                    value={formData.school}
                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Cargo / Posición"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    placeholder="Ej: Director, Coordinador Académico"
                                    required
                                />
                                <Input
                                    label="Correo Electrónico Institucional"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                label="Teléfono de Contacto"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="449 123 4567"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                    Taller de Interés
                                </label>
                                <select
                                    value={formData.interest}
                                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                                    required
                                >
                                    <option value="">Selecciona un taller</option>
                                    {WORKSHOPS.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.title}
                                        </option>
                                    ))}
                                    <option value="multiple">Varios talleres</option>
                                    <option value="custom">Propuesta personalizada</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full py-4 text-base" isLoading={isSubmitting}>
                                <Send size={18} className="mr-2" /> Enviar Solicitud
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
