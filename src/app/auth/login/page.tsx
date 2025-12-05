"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { login, saveSession, getRedirectPath } from "@/lib/auth-service";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const session = await login(email, password);

            if (!session) {
                setError("Credenciales inválidas. Intenta de nuevo.");
                setIsLoading(false);
                return;
            }

            saveSession(session);
            const redirectPath = getRedirectPath(session.user.role);
            router.push(redirectPath);
        } catch (err) {
            setError("Ocurrió un error. Por favor intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h1>
                        <p className="text-gray-600">Ingresa a tu cuenta de Conética Educativa™</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Demo Credentials */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-bold text-blue-900 mb-2">Credenciales de Demo:</p>
                        <div className="text-xs text-blue-700 space-y-1">
                            <p><strong>Estudiante:</strong> estudiante@example.com</p>
                            <p><strong>Padre:</strong> padre@example.com</p>
                            <p><strong>Admin:</strong> admin@coneticaeducativa.com</p>
                            <p className="mt-2"><strong>Contraseña:</strong> demo123</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={18} />}
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full py-3"
                            isLoading={isLoading}
                        >
                            Iniciar Sesión
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        ¿No tienes cuenta?{" "}
                        <Link href="/auth/register" className="text-[var(--color-brand-600)] font-medium hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden md:flex items-center justify-center p-8 gradient-brand text-white">
                <div className="max-w-md text-center">
                    <h2 className="text-4xl font-bold mb-4">Conética Educativa™</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Transforma tu aprendizaje con estrategias basadas en evidencia científica.
                    </p>
                    <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Diagnósticos personalizados</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Preparación EXANI-II</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Orientación vocacional</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
