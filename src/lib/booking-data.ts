import { Users, Compass, TrendingUp, BookOpen, type LucideIcon } from "lucide-react";

export interface Service {
    id: string;
    title: string;
    description: string;
    duration: number; // minutes
    price: number;
    icon: LucideIcon;
    color: string;
    bg: string;
}

export interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
}

export const SERVICES: Service[] = [
    {
        id: 'mentorship',
        title: 'Mentoría Personalizada',
        description: 'Sesión 1:1 para revisar tu plan de vida, metas y estrategia académica.',
        duration: 60,
        price: 500,
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        id: 'vocational',
        title: 'Asesoría Vocacional',
        description: 'Profundización en tus resultados RIASEC y exploración de carreras.',
        duration: 45,
        price: 400,
        icon: Compass,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
    {
        id: 'exani',
        title: 'Coaching EXANI-II',
        description: 'Resolución de dudas específicas y estrategias para el examen de admisión.',
        duration: 60,
        price: 450,
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        id: 'academic',
        title: 'Apoyo Académico',
        description: 'Tutoría en materias específicas (Matemáticas, Lectura, Inglés).',
        duration: 60,
        price: 350,
        icon: BookOpen,
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    }
];

export function getAvailableSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dateKey = date.toISOString().split('T')[0];
    const daySeed = date.getDate() + date.getMonth() * 31;
    const startHour = 9;
    const endHour = 18;

    for (let i = startHour; i < endHour; i++) {
        // Deterministic availability based on date + hour so SSR/CSR stays consistent
        const availableFull = (daySeed + i * 3) % 4 !== 0;
        const availableHalf = (daySeed + i * 5 + 1) % 4 !== 0;

        slots.push({
            id: `${dateKey}-${i}-00`,
            time: `${i}:00`,
            available: availableFull
        });
        slots.push({
            id: `${dateKey}-${i}-30`,
            time: `${i}:30`,
            available: availableHalf
        });
    }

    return slots;
}
