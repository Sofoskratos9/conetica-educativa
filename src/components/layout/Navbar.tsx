"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Compass, ArrowRight, LayoutDashboard } from "lucide-react";
import { getCurrentUser, fetchServerSession, getRedirectPath, type User } from "@/lib/auth-service";
import { Button } from "@/components/ui/Button";
import { clsx } from "clsx";

const NAV_LINKS = [
    { href: "/services", label: "Servicios" },
    { href: "/pricing", label: "Planes" },
    { href: "/schools", label: "Escuelas" },
    { href: "/blog", label: "Blog" },
    { href: "/legal/ethics", label: "Ética" },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
        fetchServerSession().then((u) => {
            setUser(u);
        });
    }, [pathname]);

    return (
        <header className="sticky top-0 z-40 glass-effect">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <Compass size={20} className="text-[#F6DDCC]" />
                        </div>
                        <div className="leading-none">
                            <span className="font-bold text-lg text-[var(--color-brand-900)] tracking-tight">
                                Conética
                            </span>
                            <span className="hidden sm:inline font-medium text-sm text-[var(--color-accent-600)] ml-1">
                                Educativa™
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => {
                            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                                        active
                                            ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)]"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="https://cal.com/miguel-neftali-lopez-wnkrwr/consultoria"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 text-sm font-semibold text-[var(--color-accent-600)] hover:text-[var(--color-brand-700)] transition-colors"
                        >
                            Sesión NEFTALÍ · $400
                        </a>
                        {user ? (
                            <Link href={getRedirectPath(user.role)}>
                                <Button size="sm" className="gap-2">
                                    <LayoutDashboard size={16} />
                                    Ir a mi Panel
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-[var(--color-brand-600)] transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm" className="gap-1.5">
                                        Crear cuenta
                                        <ArrowRight size={15} />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        aria-label="Abrir menú de navegación"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <a
                            href="https://cal.com/miguel-neftali-lopez-wnkrwr/consultoria"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-accent-600)] hover:bg-slate-50"
                        >
                            Sesión NEFTALÍ · $400
                        </a>
                        {user ? (
                            <Link href={getRedirectPath(user.role)} onClick={() => setMobileOpen(false)}>
                                <Button className="w-full justify-center gap-2">
                                    <LayoutDashboard size={16} /> Ir a mi Panel
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                                    <Button variant="outline" className="w-full justify-center">
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                                    <Button className="w-full justify-center">
                                        Crear cuenta
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
