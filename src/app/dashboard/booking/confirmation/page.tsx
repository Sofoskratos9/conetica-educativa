"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SERVICES } from "@/lib/booking-data";
import { CheckCircle, Calendar, MessageCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { WhatsAppOptIn } from "@/components/whatsapp/WhatsAppOptIn";
import { scheduleWhatsAppMessage } from "@/lib/whatsapp-service";

function BookingConfirmation() {
    const searchParams = useSearchParams();
    const serviceId = searchParams.get('service');
    const dateStr = searchParams.get('date');
    const time = searchParams.get('time');

    const service = SERVICES.find(s => s.id === serviceId);
    const date = dateStr ? new Date(dateStr) : null;

    const handleWhatsAppOptIn = async (phoneNumber: string) => {
        if (service && date && time) {
            await scheduleWhatsAppMessage(phoneNumber, 'booking_confirmation', {
                name: 'Estudiante', // In production, get from user session
                service: service.title,
                date: date.toLocaleDateString('es-MX'),
                time: time,
                modality: 'Virtual'
            });
            alert('¡Listo! Recibirás la confirmación por WhatsApp.');
        }
    };

    if (!service || !date || !time) {
        return <div>Datos de reserva inválidos.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-8 border border-gray-200 shadow-xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h1>
                <p className="text-gray-500 mb-8">
                    Tu sesión ha sido agendada exitosamente. Hemos enviado un correo con los detalles.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-gray-500">Servicio</div>
                            <div className="font-bold text-gray-900">{service.title}</div>
                        </div>
                        <div className={`p-2 rounded-lg ${service.bg} ${service.color}`}>
                            <service.icon size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Fecha</div>
                            <div className="font-medium text-gray-900">
                                {date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Hora</div>
                            <div className="font-medium text-gray-900">{time}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-center gap-2">
                        <Calendar size={18} /> Agregar a Google Calendar
                    </Button>
                    <Button variant="outline" className="w-full justify-center gap-2 text-green-700 border-green-200 hover:bg-green-50">
                        <MessageCircle size={18} /> Recibir recordatorio por WhatsApp
                    </Button>
                </div>

                <div className="mt-8">
                    <WhatsAppOptIn onOptIn={handleWhatsAppOptIn} context="booking" />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link href="/dashboard">
                        <span className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1">
                            <Home size={16} /> Volver al Inicio
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={<div>Procesando confirmación...</div>}>
            <BookingConfirmation />
        </Suspense>
    );
}
