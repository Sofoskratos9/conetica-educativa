"use client";

import { getCurrentUser, hasPermission, type User } from "@/lib/auth-service";
import { useEffect, useState } from "react";

interface RoleGuardProps {
    children: React.ReactNode;
    permission?: keyof ReturnType<typeof hasPermission>;
    allowedRoles?: ('student' | 'parent' | 'admin')[];
    fallback?: React.ReactNode;
}

export function RoleGuard({
    children,
    permission,
    allowedRoles,
    fallback = null
}: RoleGuardProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    if (!user) {
        return <>{fallback}</>;
    }

    // Check by permission
    if (permission && !hasPermission(user, permission as any)) {
        return <>{fallback}</>;
    }

    // Check by role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
