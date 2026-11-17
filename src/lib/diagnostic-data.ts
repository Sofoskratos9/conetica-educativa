export type DiagnosticArea = 'math' | 'reading' | 'executive' | 'self_regulation';

export interface DiagnosticQuestion {
    id: string;
    area: DiagnosticArea;
    areaLabel: string;
    prompt: string;
    options: { label: string; value: number }[];
    correctIndex?: number; // Defined for cognitive-academic objective items
    explanation?: string;
}

export const DIAGNOSTIC_AREA_META: Record<
    DiagnosticArea,
    { label: string; description: string; recommendation: string }
> = {
    math: {
        label: 'Pensamiento Matemático',
        description: 'Razonamiento cuantitativo, proporciones, álgebra y análisis de datos.',
        recommendation: 'Prioriza bloques de 45 min resolviendo problemas sin calculadora con verificación paso a paso.',
    },
    reading: {
        label: 'Comprensión Lectora',
        description: 'Inferencia, identificación de tesis, estructura argumentativa y vocabulario contextual.',
        recommendation: 'Aplica lectura activa: resume la idea principal de cada párrafo en el margen.',
    },
    executive: {
        label: 'Atención y Memoria de Trabajo',
        description: 'Sostenimiento del foco, control de distracciones y retención operativa.',
        recommendation: 'Utiliza ciclos Pomodoro de 25/5 min con el teléfono en otra habitación.',
    },
    self_regulation: {
        label: 'Autorregulación y Hábitos',
        description: 'Planificación semanal, monitoreo del progreso y manejo de tiempos de estudio.',
        recommendation: 'Define tus 3 tareas prioritarias cada domingo y usa repetición espaciada.',
    },
};

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
    {
        id: 'd1',
        area: 'math',
        areaLabel: 'Pensamiento Matemático',
        prompt: 'Si un estudiante resuelve 18 reactivos en 24 minutos manteniendo un ritmo constante, ¿cuántos reactivos resolverá en 1 hora?',
        options: [
            { label: '40 reactivos', value: 0 },
            { label: '45 reactivos', value: 100 },
            { label: '48 reactivos', value: 0 },
            { label: '52 reactivos', value: 0 },
        ],
        correctIndex: 1,
        explanation: '18 / 24 = 0.75 reactivos por minuto. En 60 minutos: 0.75 × 60 = 45 reactivos.',
    },
    {
        id: 'd2',
        area: 'math',
        areaLabel: 'Pensamiento Matemático',
        prompt: 'En un grupo de 40 aspirantes, el 35% eligió Ciencias de la Salud y el resto Ingenierías. ¿Cuántos aspirantes eligieron Ingenierías?',
        options: [
            { label: '14 aspirantes', value: 0 },
            { label: '24 aspirantes', value: 0 },
            { label: '26 aspirantes', value: 100 },
            { label: '28 aspirantes', value: 0 },
        ],
        correctIndex: 2,
        explanation: 'El 65% restante corresponde a 40 × 0.65 = 26 aspirantes.',
    },
    {
        id: 'd3',
        area: 'math',
        areaLabel: 'Pensamiento Matemático',
        prompt: '¿Cuál es el valor de x en la ecuación 3(x - 4) + 2 = 17?',
        options: [
            { label: 'x = 7', value: 0 },
            { label: 'x = 9', value: 100 },
            { label: 'x = 11', value: 0 },
            { label: 'x = 5', value: 0 },
        ],
        correctIndex: 1,
        explanation: '3x - 12 + 2 = 17 → 3x - 10 = 17 → 3x = 27 → x = 9.',
    },
    {
        id: 'd4',
        area: 'reading',
        areaLabel: 'Comprensión Lectora',
        prompt: '«Aunque la memorización pasiva genera una ilusión de dominio inmediato, la evidencia cognitiva demuestra que la práctica de recuperación espaciada consolida la memoria a largo plazo.» ¿Cuál es la tesis central?',
        options: [
            { label: 'La memoria a corto plazo es superior al aprendizaje espaciado.', value: 0 },
            { label: 'Releer apuntes repetidamente garantiza buenos resultados.', value: 0 },
            { label: 'Evocar información de forma espaciada supera a la memorización pasiva.', value: 100 },
            { label: 'La ilusión de dominio ayuda a reducir la ansiedad antes de exámenes.', value: 0 },
        ],
        correctIndex: 2,
        explanation: 'El texto contrasta la ilusión de dominio de la memorización pasiva frente a la eficacia comprobada de la recuperación espaciada.',
    },
    {
        id: 'd5',
        area: 'reading',
        areaLabel: 'Comprensión Lectora',
        prompt: 'En el enunciado: «Su argumento resultó tan diáfano que convenció al jurado en minutos», el término "diáfano" equivale contextualmente a:',
        options: [
            { label: 'Complejo y técnico', value: 0 },
            { label: 'Claro y transparente', value: 100 },
            { label: 'Breve y superficial', value: 0 },
            { label: 'Polémico y audaz', value: 0 },
        ],
        correctIndex: 1,
        explanation: 'Diáfano significa claro, limpio o fácil de comprender sin ambigüedades.',
    },
    {
        id: 'd6',
        area: 'reading',
        areaLabel: 'Comprensión Lectora',
        prompt: '¿Qué función cumple un contraargumento bien integrado en un ensayo académico?',
        options: [
            { label: 'Debilitar la postura propia para parecer neutral.', value: 0 },
            { label: 'Anticipar objeciones válidas y fortalecer la tesis mediante refutación fundamentada.', value: 100 },
            { label: 'Rellenar extensión cuando faltan datos empíricos.', value: 0 },
            { label: 'Reemplazar la introducción del texto.', value: 0 },
        ],
        correctIndex: 1,
        explanation: 'Abordar y refutar objeciones demuestra rigor crítico y solidez argumentativa.',
    },
    {
        id: 'd7',
        area: 'executive',
        areaLabel: 'Atención y Memoria de Trabajo',
        prompt: 'Durante una sesión de estudio de 45 minutos, ¿con qué frecuencia revisas notificaciones o cambias de pestaña sin relación con el tema?',
        options: [
            { label: 'Casi nunca (0 a 1 vez por sesión)', value: 100 },
            { label: 'Ocasionalmente (2 a 3 veces)', value: 70 },
            { label: 'Con frecuencia (cada 10 minutos)', value: 40 },
            { label: 'Constantemente', value: 20 },
        ],
    },
    {
        id: 'd8',
        area: 'executive',
        areaLabel: 'Atención y Memoria de Trabajo',
        prompt: 'Cuando lees un problema largo de matemáticas o comprensión lectora, ¿qué tan bien retienes los datos iniciales mientras analizas la pregunta final?',
        options: [
            { label: 'Excelente: organizo datos mentalmente o en esquema al primer intento', value: 100 },
            { label: 'Bien: necesito releer solo una vez para confirmar', value: 75 },
            { label: 'Regular: suelo olvidar condiciones importantes del enunciado', value: 45 },
            { label: 'Me cuesta mucho conectar los datos del inicio con la pregunta', value: 25 },
        ],
    },
    {
        id: 'd9',
        area: 'self_regulation',
        areaLabel: 'Autorregulación y Hábitos',
        prompt: '¿Cómo organizas normalmente tu preparación semanal antes de un examen importante?',
        options: [
            { label: 'Divido temas por día y verifico lo aprendido con autoevaluaciones', value: 100 },
            { label: 'Tengo una lista general de temas pero sin horarios fijos', value: 70 },
            { label: 'Estudio principalmente los últimos 2 o 3 días', value: 35 },
            { label: 'No suelo planear; estudio cuando me acuerdo', value: 20 },
        ],
    },
    {
        id: 'd10',
        area: 'self_regulation',
        areaLabel: 'Autorregulación y Hábitos',
        prompt: 'Cuando cometes un error en un ejercicio de práctica, ¿qué haces inmediatamente después?',
        options: [
            { label: 'Analizo por qué fallé, anoto la regla y repito un problema similar', value: 100 },
            { label: 'Reviso la respuesta correcta y sigo adelante', value: 70 },
            { label: 'Paso al siguiente ejercicio sin revisar el error', value: 35 },
            { label: 'Me frustro y suelo abandonar la sesión', value: 20 },
        ],
    },
];
