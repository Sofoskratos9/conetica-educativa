import { Bell, BookOpen, Star, Zap } from "lucide-react";

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'premium';
    timestamp: string;
    read: boolean;
    actionLink?: string;
    icon?: any;
}

export interface AutomationLog {
    id: string;
    trigger: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    status: 'success' | 'failed';
}

// Mock Notifications for Demo
export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        userId: 'user_123',
        title: '¡Bienvenido a Conética!',
        message: 'Has completado tu diagnóstico inicial. Te recomendamos comenzar con el Módulo 1: Diagnóstico Cognitivo.',
        type: 'success',
        timestamp: 'Hace 2 horas',
        read: false,
        actionLink: '/dashboard',
        icon: Star
    },
    {
        id: '2',
        userId: 'user_123',
        title: 'Tu Plan de Estudio te espera',
        message: 'Han pasado 24h desde tu registro. Mantén el ritmo revisando tus tareas de hoy.',
        type: 'info',
        timestamp: 'Hace 1 día',
        read: true,
        actionLink: '/dashboard',
        icon: BookOpen
    },
    {
        id: '3',
        userId: 'user_123',
        title: 'Descubre tu Vocación',
        message: '¿Aún indeciso? Prueba nuestro Test Vocacional RIASEC y encuentra tu camino ideal.',
        type: 'info',
        timestamp: 'Hace 3 días',
        read: true,
        actionLink: '/dashboard/vocational',
        icon: Zap
    },
    {
        id: '4',
        userId: 'user_123',
        title: 'Desbloquea todo el potencial',
        message: 'Llevas 5 días progresando. Acelera tu admisión con Conética Premium.',
        type: 'premium',
        timestamp: 'Hace 5 días',
        read: true,
        actionLink: '/pricing',
        icon: Star
    }
];

// Mock Logs for Admin
export const MOCK_AUTOMATION_LOGS: AutomationLog[] = [
    {
        id: 'log_1',
        trigger: 'Diagnóstico Completado',
        userId: 'user_123',
        userName: 'Miguel López',
        action: 'Sent: Welcome Message + Module Rec',
        timestamp: '2025-12-05 09:00:00',
        status: 'success'
    },
    {
        id: 'log_2',
        trigger: 'Time: 24h Post-Register',
        userId: 'user_123',
        userName: 'Miguel López',
        action: 'Sent: Study Plan Reminder',
        timestamp: '2025-12-06 09:00:00',
        status: 'success'
    },
    {
        id: 'log_3',
        trigger: 'Time: 72h Inactive',
        userId: 'user_456',
        userName: 'Ana García',
        action: 'Sent: Vocational Module Suggestion',
        timestamp: '2025-12-08 14:30:00',
        status: 'success'
    },
    {
        id: 'log_4',
        trigger: 'Time: 5 Days Active',
        userId: 'user_789',
        userName: 'Carlos Ruiz',
        action: 'Sent: Premium Upsell',
        timestamp: '2025-12-10 10:15:00',
        status: 'success'
    }
];
