"use client";

import Link from "next/link";
import { Users, LogOut, Settings, BarChart, Home } from "lucide-react";

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar for Parents */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-[var(--color-brand-600)] rounded-lg flex items-center justify-center text-white font-bold">
                                    C
                                </div>
                                <span className="font-bold text-gray-900">Conética Familia</span>
                            </Link>

                            <div className="hidden md:flex space-x-8">
                                <Link href="/parent/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-[var(--color-brand-500)] text-sm font-medium text-gray-900">
                                    <Home size={18} className="mr-2" /> Resumen
                                </Link>
                                <Link href="#" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                    <BarChart size={18} className="mr-2" /> Reportes Detallados
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right hidden sm:block">
                                <div className="font-medium text-gray-900">Familia López</div>
                                <div className="text-xs text-gray-500">Padre/Tutor</div>
                            </div>
                            <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                                <Users size={20} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
