"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [demoResetUrl, setDemoResetUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setDemoResetUrl("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No se pudo procesar tu solicitud.");
            } else {
                setMessage(data.message);
                if (data.demoResetUrl) {
                    setDemoResetUrl(data.demoResetUrl);
                }
            }
        } catch {
            setError("Error de conexión con el servidor. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-6">
                <div>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6"
                    >
                        <ArrowLeft size={16} /> Volver al inicio de sesión
                    </Link>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--color-brand-600)] flex items-center justify-center mb-4">
                        <KeyRound size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Recuperar cuenta</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Ingresa el correo registrado y te enviaremos un enlace seguro para crear una nueva contraseña.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {message ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-emerald-900">{message}</p>
                        </div>

                        {demoResetUrl && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                                    Vista previa (Modo Demo sin SMTP)
                                </p>
                                <p className="text-xs text-blue-800">
                                    Usa este enlace temporal firmado para restablecer la contraseña de prueba:
                                </p>
                                <Link
                                    href={demoResetUrl}
                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline break-all"
                                >
                                    Abrir enlace de recuperación <ExternalLink size={14} />
                                </Link>
                            </div>
                        )}

                        <Link href="/auth/login" className="block">
                            <Button variant="outline" className="w-full justify-center">
                                Regresar al Login
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            icon={<Mail size={18} />}
                            required
                        />
                        <Button type="submit" className="w-full py-3.5" isLoading={isLoading}>
                            Enviar enlace de recuperación
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
