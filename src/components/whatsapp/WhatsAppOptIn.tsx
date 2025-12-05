"use client";

import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WhatsAppOptInProps {
    onOptIn: (phoneNumber: string) => void;
    context?: 'booking' | 'progress' | 'general';
}

export function WhatsAppOptIn({ onOptIn, context = 'general' }: WhatsAppOptInProps) {
    const [phone, setPhone] = useState('');
    const [accepted, setAccepted] = useState(false);

    const messages = {
        booking: {
            title: 'Recibe confirmación por WhatsApp',
            description: 'Te enviaremos la confirmación de tu cita y un recordatorio 24h antes.',
            benefits: ['Confirmación instantánea', 'Recordatorio automático', 'Fácil reagendación']
        },
        progress: {
            title: 'Mantente al día con tu progreso',
            description: 'Recibe actualizaciones semanales de tus avances y logros.',
            benefits: ['Resumen semanal', 'Celebración de logros', 'Recomendaciones personalizadas']
        },
        general: {
            title: 'Comunicación directa por WhatsApp',
            description: 'Mantente informado sobre tu aprendizaje de forma conveniente.',
            benefits: ['Sin spam', 'Solo información relevante', 'Puedes darte de baja en cualquier momento']
        }
    };

    const config = messages[context];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone && accepted) {
            onOptIn(phone);
        }
    };

    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-500 rounded-full text-white">
                    <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{config.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                    <ul className="space-y-1 mb-4">
                        {config.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <Check size={14} className="text-green-600" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de WhatsApp
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: 4491234567"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                        required
                    />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1"
                        required
                    />
                    <span className="text-xs text-gray-600">
                        Acepto recibir mensajes educativos por WhatsApp. Puedo darme de baja en cualquier momento respondiendo "BAJA".
                    </span>
                </label>

                <Button
                    type="submit"
                    disabled={!phone || !accepted}
                    className="w-full bg-green-500 hover:bg-green-600"
                >
                    <MessageCircle size={18} className="mr-2" />
                    Activar Notificaciones
                </Button>
            </form>
        </div>
    );
}
