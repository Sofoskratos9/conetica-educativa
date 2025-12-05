"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Brain,
    BookOpen,
    TrendingUp,
    Activity,
    Compass,
    Settings,
    LogOut,
    Bell,
    Menu
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Diagnóstico', href: '/dashboard/diagnostic', icon: Brain },
        { name: 'Plan de Estudio', href: '/dashboard/study-plan', icon: BookOpen },
        { name: 'Práctica EXANI', href: '/dashboard/exani', icon: TrendingUp },
        { name: 'Bienestar', href: '/dashboard/wellness', icon: Activity },
        { name: 'Vocacional', href: '/dashboard/vocational', icon: Compass },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link href="/" className="text-xl font-bold text-[var(--color-brand-600)]">
                        Conética
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon size={20} className={isActive ? "text-[var(--color-brand-500)]" : "text-gray-400"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-1">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Settings size={20} className="text-gray-400" />
                        Configuración
                    </Link>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 px-4 lg:px-0">
                        <h1 className="text-lg font-semibold text-gray-800 lg:hidden">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-gray-900">Miguel López</div>
                                <div className="text-xs text-gray-500">Estudiante</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center text-[var(--color-brand-600)] font-bold">
                                ML
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
