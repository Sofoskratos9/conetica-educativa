"use client";

import { MessageCircle } from "lucide-react";
import { generateBusinessWhatsAppURL } from "@/lib/whatsapp-service";

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
    const handleClick = () => {
        const url = generateBusinessWhatsAppURL(message);
        window.open(url, '_blank');
    };

    if (variant === 'floating') {
        return (
            <button
                onClick={handleClick}
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2 group"
                aria-label="Contactar por WhatsApp"
            >
                <MessageCircle size={24} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                    {label}
                </span>
            </button>
        );
    }

    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all";
    const variantClasses = variant === 'primary'
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50';

    return (
        <button
            onClick={handleClick}
            className={`${baseClasses} ${variantClasses} ${className}`}
        >
            <MessageCircle size={18} />
            {label}
        </button>
    );
}
