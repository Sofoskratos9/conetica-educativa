"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SERVICES } from "@/lib/booking-data";
import { CheckCircle, Calendar, MessageCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppOptIn } from "@/components/whatsapp/WhatsAppOptIn";
import { scheduleWhatsAppMessage, generateBusinessWhatsAppURL } from "@/lib/whatsapp-service";

function BookingConfirmation() {
    const searchParams = useSearchParams();
    const serviceId = searchParams.get("service");
    const dateStr = searchParams.get("date");
    const time = searchParams.get("time");
    const [optInSuccess, setOptInSuccess] = useState(false);

    const service = SERVICES.find((s) => s.id === serviceId);
    const date = dateStr ? new Date(dateStr) : null;

    const handleWhatsAppOptIn = async (phoneNumber: string) => {
        if (service && date && time) {
            await scheduleWhatsAppMessage(phoneNumber, "booking_confirmation", {
                name: "Estudiante",
                service: service.title,
                date: date.toLocaleDateString("es-MX"),
                time: time,
                modality: "Virtual",
            });
            setOptInSuccess(true);
        }
    };

    const handleAddToGoogleCalendar = () => {
        if (!service || !date || !time) return;
        const [hours, minutes] = time.split(":").map(Number);
        const start = new Date(date);
        start.setHours(hours || 10, minutes || 0, 0, 0);
        const end = new Date(start.getTime() + service.duration * 60_000);
        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            `Conética Educativa: ${service.title}`
        )}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(service.description)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleDirectWhatsApp = () => {
        if (!service || !date || !time) return;
        const msg = `Hola, acabo de agendar mi sesión de ${service.title} para el ${date.toLocaleDateString("es-MX")} a las ${time}.`;
        window.open(generateBusinessWhatsAppURL(msg), "_blank", "noopener,noreferrer");
    };

    if (!service || !date || !time) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <h1 className="text-xl font-bold text-slate-900">Datos de reserva no encontrados</h1>
                <Link href="/dashboard/booking">
                    <Button>Seleccionar un Servicio</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Reserva Confirmada!</h1>
                <p className="text-slate-600 mb-8 text-sm">
                    Tu sesión ha sido agendada exitosamente. Guarda el evento en tu calendario o activa tu recordatorio.
                </p>

                <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-xs text-slate-500">Servicio</div>
                            <div className="font-bold text-slate-900">{service.title}</div>
                        </div>
                        <div className={`p-2 rounded-lg ${service.bg} ${service.color}`}>
                            <service.icon size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-slate-500">Fecha</div>
                            <div className="font-semibold text-slate-900 text-sm">
                                {date.toLocaleDateString("es-MX", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Hora</div>
                            <div className="font-semibold text-slate-900 text-sm">{time} hrs</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="outline"
                        onClick={handleAddToGoogleCalendar}
                        className="w-full justify-center gap-2"
                    >
                        <Calendar size={18} /> Agregar a Google Calendar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDirectWhatsApp}
                        className="w-full justify-center gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                        <MessageCircle size={18} /> Confirmar por WhatsApp
                    </Button>
                </div>

                <div className="mt-6 text-left">
                    {optInSuccess ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium text-center">
                            ¡Listo! Recordatorio programado por WhatsApp.
                        </div>
                    ) : (
                        <WhatsAppOptIn onOptIn={handleWhatsAppOptIn} context="booking" />
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                    <Link
                        href="/dashboard"
                        className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1.5"
                    >
                        <Home size={16} /> Volver al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Procesando confirmación...</div>}>
            <BookingConfirmation />
        </Suspense>
    );
}
