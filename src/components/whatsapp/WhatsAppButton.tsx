"use client";

import { MessageCircle, Mail } from "lucide-react";
import {
    generateBusinessWhatsAppURL,
    isWhatsAppBusinessConfigured,
} from "@/lib/whatsapp-service";

interface WhatsAppButtonProps {
    message?: string;
    label?: string;
    variant?: 'primary' | 'secondary' | 'floating';
    className?: string;
}

export function WhatsAppButton({
    message,
    label = "Contactar por WhatsApp",
    variant = 'primary',
    className = ''
}: WhatsAppButtonProps) {
    const hasWhatsApp = isWhatsAppBusinessConfigured();
    const effectiveLabel = hasWhatsApp
        ? label
        : label === "Contactar por WhatsApp"
        ? "Contactar por Correo"
        : label;

    const handleClick = () => {
        const url = generateBusinessWhatsAppURL(message);
        if (url.startsWith('mailto:')) {
            window.location.href = url;
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const Icon = hasWhatsApp ? MessageCircle : Mail;

    if (variant === 'floating') {
        return (
            <button
                type="button"
                onClick={handleClick}
                className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2 group"
                aria-label={effectiveLabel}
            >
                <Icon size={24} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-semibold">
                    {effectiveLabel}
                </span>
            </button>
        );
    }

    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all";
    const variantClasses = variant === 'primary'
        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
        : 'bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50';

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`${baseClasses} ${variantClasses} ${className}`}
        >
            <Icon size={18} />
            {effectiveLabel}
        </button>
    );
}

