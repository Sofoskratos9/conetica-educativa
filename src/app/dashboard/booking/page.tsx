"use client";

import Link from "next/link";
import { SERVICES } from "@/lib/booking-data";
import { ArrowRight, Clock, DollarSign } from "lucide-react";

export default function BookingPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Agendar Sesión 1:1</h1>
                <p className="text-gray-500 mt-2">Selecciona el tipo de servicio que necesitas para continuar.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {SERVICES.map((service) => (
                    <Link key={service.id} href={`/dashboard/booking/calendar?service=${service.id}`}>
                        <div className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-[var(--color-brand-500)] hover:shadow-md transition-all h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${service.bg} ${service.color}`}>
                                    <service.icon size={28} />
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                    <Clock size={14} /> {service.duration} min
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 flex-1">
                                {service.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="font-bold text-gray-900 flex items-center">
                                    <DollarSign size={16} className="text-gray-400" />
                                    {service.price} <span className="text-xs font-normal text-gray-500 ml-1">MXN</span>
                                </div>
                                <span className="flex items-center text-sm font-bold text-[var(--color-brand-600)]">
                                    Seleccionar <ArrowRight size={16} className="ml-1" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
