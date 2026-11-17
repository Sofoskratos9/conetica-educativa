export type ExaniArea =
    | 'Pensamiento Matemático'
    | 'Pensamiento Analítico'
    | 'Estructura de la Lengua'
    | 'Comprensión Lectora';

export interface ExaniQuestion {
    id: string;
    area: ExaniArea;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
}

export const EXANI_QUESTIONS: ExaniQuestion[] = [
    {
        id: 'ex1',
        area: 'Pensamiento Matemático',
        difficulty: 'Intermedio',
        question: 'Un tanque de agua tiene una capacidad de 1,200 litros. Si actualmente contiene 3/5 de su capacidad y se consumen 180 litros, ¿qué porcentaje de la capacidad total queda disponible en el tanque?',
        options: ['40%', '45%', '50%', '55%'],
        correctIndex: 1,
        explanation: '3/5 de 1,200 = 720 litros. Al restar 180 litros quedan 540 litros. 540 / 1,200 = 0.45 = 45%.',
    },
    {
        id: 'ex2',
        area: 'Pensamiento Matemático',
        difficulty: 'Básico',
        question: 'Si el promedio de 5 calificaciones es 84 y cuatro de ellas son 80, 86, 90 y 78, ¿cuál es la quinta calificación?',
        options: ['82', '84', '86', '88'],
        correctIndex: 2,
        explanation: 'La suma total debe ser 5 × 84 = 420. Las 4 conocidas suman 80+86+90+78 = 334. 420 - 334 = 86.',
    },
    {
        id: 'ex3',
        area: 'Pensamiento Matemático',
        difficulty: 'Avanzado',
        question: 'Una recta pasa por los puntos (2, 5) y (6, 13). ¿Cuál es la ecuación que la representa?',
        options: ['y = 2x + 1', 'y = 2x + 3', 'y = 3x - 1', 'y = 0.5x + 4'],
        correctIndex: 0,
        explanation: 'Pendiente m = (13 - 5) / (6 - 2) = 8 / 4 = 2. Sustituyendo (2, 5): 5 = 2(2) + b → b = 1. Ecuación: y = 2x + 1.',
    },
    {
        id: 'ex4',
        area: 'Pensamiento Analítico',
        difficulty: 'Intermedio',
        question: 'Identifica el siguiente término en la sucesión: 4, 9, 19, 39, 79, ...',
        options: ['119', '139', '159', '169'],
        correctIndex: 2,
        explanation: 'Cada término se obtiene multiplicando el anterior por 2 y sumando 1: (79 × 2) + 1 = 159.',
    },
    {
        id: 'ex5',
        area: 'Pensamiento Analítico',
        difficulty: 'Intermedio',
        question: 'Premisa 1: Todos los estudiantes que practican recuperación activa mejoran su retención. Premisa 2: Sofía practica recuperación activa diariamente. Conclusión válida:',
        options: [
            'Solo Sofía mejora su retención.',
            'Sofía mejora su retención.',
            'Quienes no mejoran su retención nunca estudian.',
            'La recuperación activa reemplaza el sueño.',
        ],
        correctIndex: 1,
        explanation: 'Por silogismo categórico deductivo (Modus Ponens universal), Sofía pertenece al conjunto que mejora su retención.',
    },
    {
        id: 'ex6',
        area: 'Pensamiento Analítico',
        difficulty: 'Básico',
        question: 'MÉDICO es a DIAGNÓSTICO como ARQUITECTO es a:',
        options: ['Ladrillo', 'Plano', 'Edificio', 'Ingeniero'],
        correctIndex: 1,
        explanation: 'La relación es profesional → instrumento/representación técnica previa a la intervención o construcción.',
    },
    {
        id: 'ex7',
        area: 'Estructura de la Lengua',
        difficulty: 'Básico',
        question: 'Elige la opción que presenta concordancia gramatical correcta:',
        options: [
            'Hubieron muchos aspirantes en la convocatoria de este año.',
            'Habían varias guías disponibles en la biblioteca digital.',
            'Hubo muchos aspirantes en la convocatoria de este año.',
            'Hacen varios meses que inició el curso propedéutico.',
        ],
        correctIndex: 2,
        explanation: 'El verbo "haber" con sentido existencial es impersonal y se conjuga siempre en tercera persona del singular ("Hubo").',
    },
    {
        id: 'ex8',
        area: 'Estructura de la Lengua',
        difficulty: 'Intermedio',
        question: '¿Cuál oración utiliza correctamente el acento diacrítico?',
        options: [
            'Aún no sé si el libro qué me prestaste es de él.',
            'Aun no se si el libro que me prestaste es de el.',
            'Aún no sé si el libro que me prestaste es de él.',
            'Aun no sé sí el libro que me prestaste es de él.',
        ],
        correctIndex: 2,
        explanation: '"Aún" (todavía) lleva tilde; "sé" (verbo saber) lleva tilde; "si" (conjunción condicional) no lleva; "que" (pronombre relativo) no lleva; "él" (pronombre personal) sí lleva.',
    },
    {
        id: 'ex9',
        area: 'Estructura de la Lengua',
        difficulty: 'Avanzado',
        question: 'Identifica el nexo que introduce una relación de concesión:',
        options: [
            'Por lo tanto',
            'A pesar de que',
            'Debido a que',
            'En primer lugar',
        ],
        correctIndex: 1,
        explanation: '"A pesar de que" introduce un obstáculo real o posible que no impide el cumplimiento de la acción principal (oración concesiva).',
    },
    {
        id: 'ex10',
        area: 'Comprensión Lectora',
        difficulty: 'Intermedio',
        question: '«La metacognición permite al estudiante supervisar qué comprende y qué desconoce en tiempo real, evitando dedicar horas extras a temas ya dominados.» De acuerdo con el fragmento, la metacognición favorece principalmente:',
        options: [
            'La velocidad de lectura mecánica.',
            'La asignación eficiente del tiempo de estudio.',
            'La memorización literal de definiciones.',
            'La eliminación total de los exámenes.',
        ],
        correctIndex: 1,
        explanation: 'Al distinguir lo dominado de lo pendiente, el estudiante distribuye su esfuerzo de forma más eficiente.',
    },
    {
        id: 'ex11',
        area: 'Comprensión Lectora',
        difficulty: 'Intermedio',
        question: 'En un artículo de divulgación científica, ¿qué elemento respalda con mayor rigor una afirmación sobre el rendimiento escolar?',
        options: [
            'Una anécdota personal del autor.',
            'Una metáfora literaria al inicio del texto.',
            'Datos empíricos comparados con un grupo de control.',
            'Una frase célebre de un filósofo clásico.',
        ],
        correctIndex: 2,
        explanation: 'La evidencia empírica con grupo de control es el estándar metodológico para sustentar causalidad o eficacia.',
    },
    {
        id: 'ex12',
        area: 'Comprensión Lectora',
        difficulty: 'Avanzado',
        question: 'Si un autor concluye su texto advirtiendo que «confundir correlación con causalidad conduce a políticas educativas ineficaces», su propósito comunicativo es:',
        options: [
            'Desacreditar toda investigación estadística.',
            'Exhortar al análisis riguroso antes de implementar intervenciones.',
            'Proponer que se eliminen las evaluaciones estandarizadas.',
            'Narrar una experiencia histórica del siglo XIX.',
        ],
        correctIndex: 1,
        explanation: 'El autor llama a distinguir asociaciones estadísticas de causas reales para diseñar mejores decisiones educativas.',
    },
];
