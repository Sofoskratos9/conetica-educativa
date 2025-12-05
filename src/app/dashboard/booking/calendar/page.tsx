"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SERVICES, getAvailableSlots, TimeSlot } from "@/lib/booking-data";
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

function BookingCalendar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const serviceId = searchParams.get('service');
    const service = SERVICES.find(s => s.id === serviceId);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    if (!service) {
        return <div>Servicio no encontrado. <Link href="/dashboard/booking">Volver</Link></div>;
    }

    const slots = getAvailableSlots(selectedDate);

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        setSelectedSlot(null);
    };

    const handleConfirm = () => {
        if (selectedSlot) {
            // In a real app, save to DB here
            const params = new URLSearchParams();
            params.set('service', service.id);
            params.set('date', selectedDate.toISOString());
            params.set('time', selectedSlot.time);
            router.push(`/dashboard/booking/confirmation?${params.toString()}`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <Link href="/dashboard/booking" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} className="mr-1" /> Volver a servicios
            </Link>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Sidebar: Service Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Tu Sesión</h2>
                    <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${service.bg} ${service.color}`}>
                            <service.icon size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">{service.title}</div>
                            <div className="text-sm text-gray-500">{service.duration} min</div>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Precio</span>
                            <span className="font-bold text-gray-900">${service.price} MXN</span>
                        </div>
                    </div>
                </div>

                {/* Main: Calendar & Slots */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                    {/* Date Picker (Simplified) */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <CalendarIcon size={20} /> Selecciona Fecha
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleDateChange(-1)} className="p-1 hover:bg-gray-100 rounded">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => handleDateChange(1)} className="p-1 hover:bg-gray-100 rounded">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <div className="text-4xl font-bold text-[var(--color-brand-600)]">
                                {selectedDate.getDate()}
                            </div>
                            <div className="text-gray-500 uppercase font-medium">
                                {selectedDate.toLocaleDateString('es-MX', { month: 'long', weekday: 'long' })}
                            </div>
                        </div>

                        <p className="text-xs text-center text-gray-400">
                            * Horarios en tiempo local (CDMX)
                        </p>
                    </div>

                    {/* Time Slots */}
                    <div className="p-6 flex-1 bg-gray-50">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock size={20} /> Horarios Disponibles
                        </h3>
                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {slots.map((slot) => (
                                <button
                                    key={slot.id}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${!slot.available
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : selectedSlot?.id === slot.id
                                                ? 'bg-[var(--color-brand-600)] text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:border-[var(--color-brand-500)]'
                                        }`}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <Button
                    disabled={!selectedSlot}
                    onClick={handleConfirm}
                    className="px-8 py-3 text-lg"
                >
                    Confirmar Reserva
                </Button>
            </div>
        </div>
    );
}

export default function BookingCalendarPage() {
    return (
        <Suspense fallback={<div>Cargando calendario...</div>}>
            <BookingCalendar />
        </Suspense>
    );
}
