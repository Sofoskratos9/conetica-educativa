"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareArticleButtonProps {
    title: string;
}

export function ShareArticleButton({ title }: ShareArticleButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        try {
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({ title, url });
                return;
            }
            if (typeof navigator !== "undefined" && navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            }
        } catch {
            // User dismissed native share sheet or clipboard restricted
        }
    };

    return (
        <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
        >
            {copied ? (
                <>
                    <Check size={16} className="text-emerald-600" />
                    Enlace copiado
                </>
            ) : (
                <>
                    <Share2 size={16} />
                    Compartir
                </>
            )}
        </button>
    );
}
