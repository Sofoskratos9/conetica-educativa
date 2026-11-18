"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    ArrowLeft,
    GraduationCap,
    Users,
    School,
    AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { register, getRedirectPath } from "@/lib/auth-service";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<"student" | "parent" | "school">("student");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (role === "school") {
            router.push("/schools");
            return;
        }

        if (!acceptedTerms) {
            setError("Debes aceptar los Términos de Uso y el Aviso de Privacidad.");
            return;
        }

        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            setError("La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.");
            return;
        }

        setIsLoading(true);
        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            const result = await register({
                name: fullName,
                email,
                password,
                role,
            });

            if (result.error || !result.session) {
                setError(result.error || "No se pudo crear la cuenta.");
                setIsLoading(false);
                return;
            }

            window.location.assign(getRedirectPath(result.session.user.role));
        } catch {
            setError("Error de conexión al registrar tu cuenta.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6"
                        >
                            <ArrowLeft size={16} /> Volver al inicio
                        </Link>
                        <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">
                            Crea tu cuenta gratuita
                        </h1>
                        <p className="mt-2 text-[var(--color-text-muted)]">
                            Comienza tu evaluación y plan de estudio con método.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole("student")}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                role === "student"
                                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                            }`}
                        >
                            <GraduationCap size={22} />
                            <span className="text-xs font-semibold">Estudiante</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("parent")}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                role === "parent"
                                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                            }`}
                        >
                            <Users size={22} />
                            <span className="text-xs font-semibold">Padre/Tutor</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("school")}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                role === "school"
                                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                            }`}
                        >
                            <School size={22} />
                            <span className="text-xs font-semibold">Institución</span>
                        </button>
                    </div>

                    {role === "school" ? (
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-900">Convenios y Talleres para Escuelas</h3>
                            <p className="text-sm text-slate-600">
                                Para instituciones educativas diseñamos propuestas a medida con acceso grupal y capacitación docente.
                            </p>
                            <Link href="/schools">
                                <Button className="w-full">
                                    Ir al Portal de Escuelas <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Nombre"
                                    placeholder="Juan"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    icon={<User size={18} />}
                                    required
                                />
                                <Input
                                    label="Apellidos"
                                    placeholder="Pérez"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>

                            <Input
                                label="Correo Electrónico"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail size={18} />}
                                required
                            />

                            <Input
                                label="Contraseña (mín. 8 caracteres, letras y números)"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={18} />}
                                required
                            />

                            <div className="flex items-start pt-1">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] border-slate-300 rounded"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                                    Acepto los{" "}
                                    <Link href="/legal/terms" className="text-[var(--color-brand-600)] hover:underline font-medium">
                                        Términos de Uso
                                    </Link>{" "}
                                    y el{" "}
                                    <Link href="/legal/privacy" className="text-[var(--color-brand-600)] hover:underline font-medium">
                                        Aviso de Privacidad
                                    </Link>
                                    .
                                </label>
                            </div>

                            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                                Crear Cuenta <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </form>
                    )}

                    <div className="text-center text-sm">
                        <span className="text-slate-500">¿Ya tienes una cuenta? </span>
                        <Link
                            href="/auth/login"
                            className="font-semibold text-[var(--color-brand-600)] hover:underline"
                        >
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex w-1/2 gradient-brand text-white relative overflow-hidden items-center justify-center p-12">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center text-emerald-400">
                        <GraduationCap size={40} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                        Únete a una comunidad educativa ética y con método
                    </h3>
                    <p className="text-slate-200 leading-relaxed">
                        Accede de inmediato a herramientas de evaluación académica, simuladores EXANI-II, orientación vocacional RIASEC y seguimiento transparente.
                    </p>
                </div>
            </div>
        </div>
    );
}
