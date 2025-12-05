"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, canAccessRoute, type User } from "@/lib/auth-service";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: ('student' | 'parent' | 'admin')[];
    fallbackPath?: string;
}

export function ProtectedRoute({
    children,
    requiredRoles,
    fallbackPath = '/auth/login'
}: ProtectedRouteProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            router.push(fallbackPath);
            return;
        }

        if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
            // Redirect to appropriate dashboard based on role
            const redirectPath = currentUser.role === 'parent'
                ? '/parent/dashboard'
                : currentUser.role === 'admin'
                    ? '/admin/analytics'
                    : '/dashboard';
            router.push(redirectPath);
            return;
        }

        setUser(currentUser);
        setIsLoading(false);
    }, [router, requiredRoles, fallbackPath]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-brand-600)] mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
