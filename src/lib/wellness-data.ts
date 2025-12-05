import { Brain, Calendar, CheckSquare, Focus } from "lucide-react";

export type StrategyCategory = 'clarity' | 'organization' | 'exam-prep' | 'attention';

export interface Strategy {
    id: string;
    title: string;
    description: string;
    steps: string[];
    science: string;
    duration: string;
}

export const CATEGORIES = [
    {
        id: 'clarity' as StrategyCategory,
        title: 'Claridad Mental',
        description: 'Técnicas para reducir la carga cognitiva y mejorar la toma de decisiones.',
        icon: Brain,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        id: 'organization' as StrategyCategory,
        title: 'Organización Semanal',
        description: 'Sistemas para estructurar tu tiempo y priorizar tareas académicas.',
        icon: Calendar,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
    {
        id: 'exam-prep' as StrategyCategory,
        title: 'Estructura Pre-Examen',
        description: 'Protocolos de preparación logística y mental para el día de la prueba.',
        icon: CheckSquare,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        id: 'attention' as StrategyCategory,
        title: 'Estrategias de Atención',
        description: 'Ejercicios para entrenar el enfoque sostenido y evitar distracciones.',
        icon: Focus,
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    }
];

export const STRATEGIES: Record<StrategyCategory, Strategy[]> = {
    clarity: [
        {
            id: 'brain-dump',
            title: 'Descarga Cognitiva (Brain Dump)',
            description: 'Libera espacio en tu memoria de trabajo escribiendo todo lo que tienes pendiente.',
            steps: [
                'Toma una hoja de papel o abre un documento en blanco.',
                'Durante 5 minutos, escribe todas las tareas, ideas o preocupaciones que tengas en mente sin filtrar.',
                'Una vez escrito, clasifica cada ítem: "¿Es accionable ahora?", "¿Es para después?", "¿Es irrelevante?".',
                'Transfiere lo accionable a tu agenda y desecha lo demás.'
            ],
            science: 'Reducir la carga en la memoria de trabajo mejora la capacidad de procesamiento para tareas complejas.',
            duration: '5-10 min'
        },
        {
            id: 'box-breathing',
            title: 'Respiración Táctica',
            description: 'Técnica utilizada para recuperar el control fisiológico ante situaciones de alta demanda.',
            steps: [
                'Inhala por la nariz contando hasta 4.',
                'Mantén el aire contando hasta 4.',
                'Exhala por la boca contando hasta 4.',
                'Mantén los pulmones vacíos contando hasta 4.',
                'Repite el ciclo 4 veces.'
            ],
            science: 'Regula el sistema nervioso autónomo, reduciendo la respuesta de "lucha o huida" y mejorando el enfoque.',
            duration: '2 min'
        }
    ],
    organization: [
        {
            id: 'time-blocking',
            title: 'Bloques de Tiempo',
            description: 'Asigna bloques específicos del día para tareas profundas y superficiales.',
            steps: [
                'Identifica tus horas de mayor energía (cronotipo).',
                'Asigna bloques de 90 minutos para estudio intenso en esas horas.',
                'Agrupa tareas administrativas (correos, mensajes) en bloques de 30 minutos por la tarde.',
                'Respeta los descansos entre bloques.'
            ],
            science: 'El cerebro opera óptimamente en ciclos ultradianos de aproximadamente 90 minutos de enfoque.',
            duration: 'Planificación semanal'
        },
        {
            id: 'eisenhower',
            title: 'Matriz de Prioridades',
            description: 'Distingue entre lo urgente y lo importante para tomar decisiones efectivas.',
            steps: [
                'Dibuja un cuadrante: Urgente/No Urgente vs Importante/No Importante.',
                'Clasifica tus tareas.',
                'Haz ya lo Importante y Urgente.',
                'Planifica lo Importante pero No Urgente (aquí está el estudio efectivo).',
                'Delega o minimiza lo demás.'
            ],
            science: 'Ayuda a superar la "mera urgencia" y enfoca recursos cognitivos en metas a largo plazo.',
            duration: '10 min'
        }
    ],
    'exam-prep': [
        {
            id: 'simulation',
            title: 'Simulación de Condiciones',
            description: 'Entrena tu cerebro para el contexto real del examen.',
            steps: [
                'Realiza exámenes de práctica a la misma hora que será tu examen real.',
                'Elimina todas las distracciones (celular, música).',
                'Usa solo los materiales permitidos (lápiz, calculadora básica).',
                'No te levantes hasta terminar el bloque de tiempo establecido.'
            ],
            science: 'El aprendizaje dependiente del contexto mejora la recuperación de información cuando las condiciones de estudio y prueba coinciden.',
            duration: 'Variable'
        },
        {
            id: 'logistics',
            title: 'Checklist Logístico',
            description: 'Elimina la incertidumbre y el gasto de energía en decisiones triviales el día del examen.',
            steps: [
                'Prepara tu ropa la noche anterior.',
                'Reúne tus materiales (lápices, identificación, comprobante) en una bolsa transparente.',
                'Planifica tu ruta y transporte con margen de error.',
                'Prepara un desayuno equilibrado (proteína y carbohidratos complejos).'
            ],
            science: 'Reducir la fatiga de decisión conserva energía mental para el rendimiento cognitivo durante la prueba.',
            duration: '15 min'
        }
    ],
    attention: [
        {
            id: 'pomodoro',
            title: 'Ciclos de Enfoque (Pomodoro)',
            description: 'Mantén la atención alta mediante intervalos de trabajo y descanso.',
            steps: [
                'Elige una sola tarea.',
                'Configura un temporizador por 25 minutos.',
                'Trabaja sin interrupciones hasta que suene.',
                'Toma un descanso breve de 5 minutos (levántate, estírate).',
                'Cada 4 ciclos, toma un descanso largo de 20 minutos.'
            ],
            science: 'Los descansos frecuentes previenen la fatiga cognitiva y mantienen niveles estables de dopamina y atención.',
            duration: '25 min + 5 min'
        }
    ]
};
