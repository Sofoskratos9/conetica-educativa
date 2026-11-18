"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Falta el token de recuperación. Solicita un enlace nuevo.");
            return;
        }
        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            setError("La nueva contraseña debe tener al menos 8 caracteres, con letras y números.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.error || "No se pudo restablecer la contraseña.");
                setIsLoading(false);
                return;
            }

            setSuccess(true);
            setIsLoading(false);
            setTimeout(() => {
                router.push("/auth/login");
            }, 2200);
        } catch {
            setError("Error de conexión al intentar actualizar tu contraseña.");
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
                        <ArrowLeft size={16} /> Ir al inicio de sesión
                    </Link>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Elige una contraseña segura para recuperar el acceso a tu cuenta.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-emerald-900">
                                Tu contraseña se actualizó correctamente. Redirigiendo al inicio de sesión...
                            </p>
                        </div>
                        <Link href="/auth/login" className="block">
                            <Button className="w-full justify-center">Iniciar Sesión ahora</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nueva Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mín. 8 caracteres (letras y números)"
                            icon={<Lock size={18} />}
                            required
                        />
                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            icon={<Lock size={18} />}
                            required
                        />
                        <Button type="submit" className="w-full py-3.5" isLoading={isLoading}>
                            Guardar Nueva Contraseña
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-50)]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-brand-600)]" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
