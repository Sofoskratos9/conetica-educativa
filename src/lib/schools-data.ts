import { Brain, Cpu, Lightbulb, Compass } from "lucide-react";

export interface Workshop {
    id: string;
    title: string;
    targetAudience: 'Alumnos' | 'Docentes' | 'Mixto';
    description: string;
    duration: string;
    benefits: string[];
    icon: any;
    color: string;
    bg: string;
}

export const WORKSHOPS: Workshop[] = [
    {
        id: 'think-before-act',
        title: 'Pensar antes de actuar',
        targetAudience: 'Alumnos',
        description: 'Taller de funciones ejecutivas y autorregulación para mejorar la toma de decisiones y reducir la impulsividad.',
        duration: '2 horas',
        benefits: ['Mejora del autocontrol', 'Resolución de conflictos', 'Planificación de tareas'],
        icon: Brain,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        id: 'responsible-ai',
        title: 'IA Responsable para Docentes',
        targetAudience: 'Docentes',
        description: 'Capacitación práctica sobre cómo integrar herramientas de IA en el aula de forma ética y productiva.',
        duration: '4 horas (Intensivo)',
        benefits: ['Herramientas actuales', 'Ética y plagio', 'Optimización de planeaciones'],
        icon: Cpu,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
    {
        id: 'critical-thinking',
        title: 'Pensamiento crítico en el aula',
        targetAudience: 'Mixto',
        description: 'Estrategias para fomentar el análisis profundo, la argumentación y la evaluación de fuentes de información.',
        duration: '3 horas',
        benefits: ['Análisis de fuentes', 'Debate estructurado', 'Detección de falacias'],
        icon: Lightbulb,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
    },
    {
        id: 'life-project',
        title: 'Proyecto de Vida',
        targetAudience: 'Alumnos',
        description: 'Guía estructurada para que los estudiantes definan sus metas a corto, mediano y largo plazo con realismo y pasión.',
        duration: 'Taller continuo (3 sesiones)',
        benefits: ['Autoconocimiento', 'Definición de metas', 'Motivación intrínseca'],
        icon: Compass,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    }
];
