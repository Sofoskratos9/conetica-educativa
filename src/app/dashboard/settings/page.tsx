"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, User as UserIcon, Shield, Bell, CheckCircle, Sparkles } from "lucide-react";
import { getCurrentUser, fetchServerSession, type User } from "@/lib/auth-service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DashboardSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [phone, setPhone] = useState("");
    const [weeklyReminders, setWeeklyReminders] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const local = getCurrentUser();
        if (local) {
            setUser(local);
            setDisplayName(local.name);
        }
        fetchServerSession().then((u) => {
            if (u) {
                setUser(u);
                setDisplayName(u.name);
            }
        });
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-brand-900)] flex items-center gap-3">
                    <Settings className="text-[var(--color-brand-600)]" /> Configuración de Cuenta
                </h1>
                <p className="text-slate-600 mt-1">
                    Administra tu perfil, suscripción y preferencias de privacidad.
                </p>
            </div>

            {saved && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <CheckCircle size={18} /> Preferencias guardadas correctamente.
                </div>
            )}

            {/* Profile Card */}
            <form onSubmit={handleSave} className="surface-card rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon size={18} className="text-[var(--color-brand-600)]" /> Perfil Personal
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                        label="Nombre completo"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <Input
                        label="Correo electrónico"
                        value={user?.email || ""}
                        disabled
                    />
                </div>
                <Input
                    label="Teléfono WhatsApp (opcional para recordatorios)"
                    type="tel"
                    placeholder="Ej: 4491234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={weeklyReminders}
                            onChange={(e) => setWeeklyReminders(e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        <Bell size={16} className="text-slate-400" />
                        Recibir resumen semanal de hábitos y metas
                    </label>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </form>

            {/* Plan Card */}
            <div className="surface-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-500" />
                        <h2 className="text-lg font-bold text-slate-900">
                            {user?.isPremium ? "Plan Conética Premium" : "Plan Básico Gratuito"}
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600">
                        {user?.isPremium
                            ? "Tienes acceso ilimitado a simuladores EXANI-II y orientación RIASEC."
                            : "Actualiza a Premium para desbloquear todos los simuladores y reportes."}
                    </p>
                </div>
                {!user?.isPremium && (
                    <Link href="/checkout?product=premium_monthly">
                        <Button>Actualizar a Premium</Button>
                    </Link>
                )}
            </div>

            {/* Privacy & Ethics */}
            <div className="surface-card rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield size={18} className="text-emerald-600" /> Privacidad y Derechos ARCO
                </h2>
                <p className="text-sm text-slate-600">
                    Tus evaluaciones educativas se resguardan conforme a la LFPDPPP. Conética Educativa™ es una plataforma estrictamente educativa y no clínica.
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-sm font-medium text-[var(--color-brand-600)]">
                    <Link href="/legal/privacy" className="hover:underline">Aviso de Privacidad</Link>
                    <Link href="/legal/terms" className="hover:underline">Términos de Uso</Link>
                    <Link href="/legal/ethics" className="hover:underline">Declaración Ética</Link>
                </div>
            </div>
        </div>
    );
}
