"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
    Mail,
    Lock,
    AlertCircle,
    Compass,
    ArrowLeft,
    Sparkles,
    Eye,
    EyeOff,
    ShieldCheck,
} from "lucide-react";
import { login, getRedirectPath } from "@/lib/auth-service";

function LoginForm() {
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        fetch("/api/health", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                if (d?.demoMode === true) {
                    setIsDemoMode(true);
                }
            })
            .catch(() => {
                // Keep demo buttons hidden if health check fails
            });
    }, []);

    const submitCredentials = async (targetEmail: string, targetPassword: string) => {
        setError("");
        setIsLoading(true);
        try {
            const result = await login(targetEmail, targetPassword);
            if (!result.session) {
                setError(
                    result.error || "Credenciales inválidas. Verifica tu correo y contraseña."
                );
                setIsLoading(false);
                return;
            }
            const safeRedirect =
                redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
                    ? redirectParam
                    : getRedirectPath(result.session.user.role);
            window.location.assign(safeRedirect);
        } catch {
            setError("Ocurrió un error al conectar con el servidor. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitCredentials(email, password);
    };

    const handleQuickDemo = async (demoEmail: "estudiante@example.com" | "padre@example.com") => {
        setEmail(demoEmail);
        setPassword("demo123");
        await submitCredentials(demoEmail, "demo123");
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-white">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6"
                        >
                            <ArrowLeft size={16} /> Volver al inicio
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenido de vuelta</h1>
                        <p className="text-slate-600">Ingresa a tu cuenta de Conética Educativa™</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Quick Demo Access (only shown in non-DB demo mode, never exposes admin) */}
                    {isDemoMode && (
                        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                                <Sparkles size={14} className="text-blue-600" />
                                <span>Explorar Vista Demo (1 clic)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleQuickDemo("estudiante@example.com")}
                                    className="px-3 py-2 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition-colors"
                                >
                                    Demo Estudiante
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleQuickDemo("padre@example.com")}
                                    className="px-3 py-2 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition-colors"
                                >
                                    Demo Padre/Tutor
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            autoComplete="email"
                            icon={<Mail size={18} />}
                            required
                        />

                        <div>
                            <div className="relative">
                                <Input
                                    label="Contraseña"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    icon={<Lock size={18} />}
                                    className="pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs font-semibold text-[var(--color-brand-600)] hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-3.5" isLoading={isLoading}>
                            Iniciar Sesión
                        </Button>
                    </form>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Sesión cifrada y protección contra fuerza bruta activa</span>
                    </div>

                    <p className="text-center text-sm text-slate-600">
                        ¿No tienes cuenta?{" "}
                        <Link
                            href="/auth/register"
                            className="text-[var(--color-brand-600)] font-semibold hover:underline"
                        >
                            Regístrate gratis aquí
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden md:flex items-center justify-center p-12 gradient-brand text-white">
                <div className="max-w-md space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Compass size={30} className="text-emerald-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white">Conética Educativa™</h2>
                    <p className="text-lg text-slate-200 leading-relaxed">
                        Tu ecosistema académico para diagnosticar áreas de oportunidad, entrenar con reactivos EXANI-II y tomar decisiones vocacionales informadas.
                    </p>
                    <div className="space-y-3 pt-2 text-sm text-slate-200">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span>Sesiones firmadas y cookies HttpOnly protegidas</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span>Panel privado por rol y filtros anti-CSRF/XSS</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span>Cumplimiento ético y de privacidad LFPDPPP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <LoginForm />
        </Suspense>
    );
}
