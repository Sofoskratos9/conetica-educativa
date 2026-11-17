"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const APP_SHELL_PREFIXES = ['/dashboard', '/parent', '/admin', '/auth'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAppShell = APP_SHELL_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (isAppShell) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
        </div>
    );
}
