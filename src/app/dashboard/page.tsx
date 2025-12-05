import { Brain, TrendingUp, Clock, Target } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">Hola, Miguel 👋</h1>
                <p className="text-[var(--color-text-muted)]">Aquí está el resumen de tu progreso académico hoy.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Puntaje Global", value: "1,150", sub: "CENEVAL Estimado", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Módulos Completados", value: "3/6", sub: "50% Progreso", icon: Brain, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Tiempo de Estudio", value: "12h", sub: "Esta semana", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Meta Semanal", value: "85%", sub: "En camino", icon: Target, color: "text-orange-600", bg: "bg-orange-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                                {stat.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Recommendations */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Placeholder) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Rendimiento por Área</h3>
                        <select className="text-sm border-gray-200 rounded-lg text-gray-500">
                            <option>Últimos 30 días</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                        Gráfico de Rendimiento (Próximamente)
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Siguientes Pasos</h3>
                    <div className="space-y-4">
                        {[
                            { title: "Completar Diagnóstico", time: "15 min", type: "Urgente" },
                            { title: "Repaso de Matemáticas", time: "30 min", type: "Recomendado" },
                            { title: "Test Vocacional", time: "20 min", type: "Opcional" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-500)]"></div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                    <p className="text-xs text-gray-500">{item.time} • {item.type}</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for the widget
import { ArrowRight } from "lucide-react";
