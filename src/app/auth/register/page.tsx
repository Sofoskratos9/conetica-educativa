"use client";

import Link from "next/link";
import { User, Mail, Lock, ArrowRight, GraduationCap, Users, School } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function RegisterPage() {
    const [role, setRole] = useState<'student' | 'parent' | 'school'>('student');

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/" className="text-2xl font-bold text-[var(--color-brand-600)]">
                            Conética Educativa™
                        </Link>
                        <h2 className="mt-6 text-3xl font-bold text-[var(--color-brand-900)]">
                            Crea tu cuenta
                        </h2>
                        <p className="mt-2 text-[var(--color-text-muted)]">
                            Comienza tu viaje educativo basado en evidencia.
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setRole('student')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                        >
                            <GraduationCap size={24} />
                            <span className="text-xs font-medium">Estudiante</span>
                        </button>
                        <button
                            onClick={() => setRole('parent')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'parent' ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                        >
                            <Users size={24} />
                            <span className="text-xs font-medium">Padre/Tutor</span>
                        </button>
                        <button
                            onClick={() => setRole('school')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'school' ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                        >
                            <School size={24} />
                            <span className="text-xs font-medium">Institución</span>
                        </button>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Nombre"
                                placeholder="Juan"
                                icon={<User size={18} />}
                            />
                            <Input
                                label="Apellidos"
                                placeholder="Pérez"
                            />
                        </div>

                        <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="tu@email.com"
                            icon={<Mail size={18} />}
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                        />

                        <div className="flex items-start">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                                Acepto los <a href="#" className="text-[var(--color-brand-600)] hover:underline">Términos de Servicio</a> y la <a href="#" className="text-[var(--color-brand-600)] hover:underline">Política de Privacidad</a>.
                            </label>
                        </div>

                        <Link href="/dashboard">
                            <Button className="w-full mt-2" size="lg">
                                Crear Cuenta <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">¿Ya tienes una cuenta? </span>
                        <Link href="/auth/login" className="font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)]">
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="hidden lg:flex w-1/2 bg-[var(--color-surface-50)] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>

                <div className="relative z-10 max-w-md text-center px-8">
                    <div className="w-20 h-20 bg-[var(--color-brand-600)] rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <GraduationCap size={40} />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-[var(--color-brand-900)]">
                        Únete a la comunidad educativa más avanzada.
                    </h3>
                    <p className="text-gray-500">
                        Accede a herramientas de diagnóstico, planes personalizados y orientación vocacional de primer nivel.
                    </p>
                </div>
            </div>
        </div>
    );
}
