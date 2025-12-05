"use client";

import { useState } from "react";
import { Calendar, Clock, User, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";

// Mock Data for Admin View
const APPOINTMENTS = [
    { id: 1, student: "Miguel López", service: "Mentoría Personalizada", date: "2025-12-10", time: "10:00", status: "confirmed" },
    { id: 2, student: "Ana García", service: "Asesoría Vocacional", date: "2025-12-10", time: "11:30", status: "pending" },
    { id: 3, student: "Carlos Ruiz", service: "Coaching EXANI-II", date: "2025-12-11", time: "16:00", status: "confirmed" },
    { id: 4, student: "Sofia Diaz", service: "Apoyo Académico", date: "2025-12-12", time: "09:00", status: "cancelled" },
];

export default function AdminAppointmentsPage() {
    const [filter, setFilter] = useState('all');

    const filteredAppointments = filter === 'all'
        ? APPOINTMENTS
        : APPOINTMENTS.filter(app => app.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
                <div className="flex gap-2">
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Todas</option>
                        <option value="confirmed">Confirmadas</option>
                        <option value="pending">Pendientes</option>
                        <option value="cancelled">Canceladas</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                            <User size={16} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{app.student}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{app.service}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" /> {app.date}
                                        <Clock size={14} className="text-gray-400 ml-2" /> {app.time}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {app.status === 'confirmed' ? 'Confirmada' :
                                            app.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
