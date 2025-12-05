export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface Question {
    id: string;
    text: string;
    type: RiasecType;
}

export interface Career {
    id: string;
    title: string;
    description: string;
    codes: RiasecType[]; // Primary and secondary codes
    area: string;
}

export const RIASEC_DESCRIPTIONS: Record<RiasecType, { title: string; description: string; keywords: string[] }> = {
    R: {
        title: "Realista (Hacedor)",
        description: "Prefieres actividades prácticas, mecánicas y realistas. Te gusta trabajar con herramientas, máquinas, plantas o animales. Valoras lo concreto y tangible.",
        keywords: ["Práctico", "Mecánico", "Independiente", "Persistente"]
    },
    I: {
        title: "Investigador (Pensador)",
        description: "Te atraen las actividades que implican pensar, organizar y comprender. Disfrutas resolviendo problemas matemáticos o científicos y analizando información.",
        keywords: ["Analítico", "Curioso", "Intelectual", "Preciso"]
    },
    A: {
        title: "Artístico (Creador)",
        description: "Valoras la expresión creativa, la originalidad y la independencia. Te gustan las actividades libres y no estructuradas que permitan la imaginación.",
        keywords: ["Creativo", "Expresivo", "Intuitivo", "Original"]
    },
    S: {
        title: "Social (Ayudador)",
        description: "Te gusta ayudar, enseñar, curar o servir a otros. Valoras las relaciones interpersonales y el bienestar comunitario.",
        keywords: ["Empático", "Amigable", "Cooperativo", "Comprensivo"]
    },
    E: {
        title: "Emprendedor (Persuasivo)",
        description: "Disfrutas liderando, persuadiendo y vendiendo ideas o productos. Te atraen el poder, el estatus y la toma de riesgos calculados.",
        keywords: ["Líder", "Enérgico", "Ambicioso", "Sociable"]
    },
    C: {
        title: "Convencional (Organizador)",
        description: "Prefieres actividades ordenadas, definidas y estructuradas. Te gusta trabajar con datos, registros y detalles organizativos.",
        keywords: ["Organizado", "Eficiente", "Detallista", "Metódico"]
    }
};

export const QUESTIONS: Question[] = [
    // Realista
    { id: 'q1', text: 'Me gusta reparar cosas o trabajar con herramientas.', type: 'R' },
    { id: 'q2', text: 'Disfruto armar y desarmar objetos mecánicos.', type: 'R' },
    { id: 'q3', text: 'Prefiero trabajar al aire libre que en una oficina.', type: 'R' },
    // Investigador
    { id: 'q4', text: 'Me gusta resolver problemas matemáticos complejos.', type: 'I' },
    { id: 'q5', text: 'Disfruto leyendo artículos científicos o técnicos.', type: 'I' },
    { id: 'q6', text: 'Me interesa entender cómo funciona el universo o la naturaleza.', type: 'I' },
    // Artístico
    { id: 'q7', text: 'Me gusta dibujar, pintar o tocar un instrumento musical.', type: 'A' },
    { id: 'q8', text: 'Disfruto escribiendo historias o poemas creativos.', type: 'A' },
    { id: 'q9', text: 'Valoro la originalidad y la expresión personal sobre las reglas.', type: 'A' },
    // Social
    { id: 'q10', text: 'Me siento bien ayudando a otros con sus problemas personales.', type: 'S' },
    { id: 'q11', text: 'Disfruto enseñando o explicando cosas a los demás.', type: 'S' },
    { id: 'q12', text: 'Prefiero trabajar en equipo que solo.', type: 'S' },
    // Emprendedor
    { id: 'q13', text: 'Me gusta liderar grupos y tomar decisiones.', type: 'E' },
    { id: 'q14', text: 'Disfruto convenciendo a otros de mis puntos de vista.', type: 'E' },
    { id: 'q15', text: 'Me interesa iniciar mi propio negocio o proyecto.', type: 'E' },
    // Convencional
    { id: 'q16', text: 'Me gusta mantener mis cosas ordenadas y organizadas.', type: 'C' },
    { id: 'q17', text: 'Disfruto trabajando con números, hojas de cálculo o bases de datos.', type: 'C' },
    { id: 'q18', text: 'Prefiero seguir instrucciones claras y procedimientos establecidos.', type: 'C' },
];

export const CAREERS_DB: Career[] = [
    { id: 'c1', title: 'Ingeniería Mecatrónica', description: 'Diseño y construcción de sistemas automatizados.', codes: ['R', 'I'], area: 'Ingeniería y Tecnología' },
    { id: 'c2', title: 'Medicina', description: 'Diagnóstico y tratamiento de enfermedades.', codes: ['I', 'S'], area: 'Ciencias de la Salud' },
    { id: 'c3', title: 'Diseño Gráfico', description: 'Comunicación visual y creación de arte digital.', codes: ['A', 'E'], area: 'Artes y Humanidades' },
    { id: 'c4', title: 'Psicología', description: 'Estudio de la mente y el comportamiento humano.', codes: ['S', 'I'], area: 'Ciencias Sociales' },
    { id: 'c5', title: 'Administración de Empresas', description: 'Gestión y dirección de organizaciones.', codes: ['E', 'C'], area: 'Negocios y Economía' },
    { id: 'c6', title: 'Contaduría', description: 'Registro y análisis financiero.', codes: ['C', 'E'], area: 'Negocios y Economía' },
    { id: 'c7', title: 'Arquitectura', description: 'Diseño y planificación de espacios habitables.', codes: ['A', 'I', 'R'], area: 'Artes e Ingeniería' },
    { id: 'c8', title: 'Desarrollo de Software', description: 'Creación de aplicaciones y sistemas informáticos.', codes: ['I', 'R', 'C'], area: 'Ingeniería y Tecnología' },
    { id: 'c9', title: 'Docencia', description: 'Enseñanza y formación académica.', codes: ['S', 'A'], area: 'Educación' },
    { id: 'c10', title: 'Marketing Digital', description: 'Promoción de productos y servicios en medios digitales.', codes: ['E', 'A'], area: 'Negocios y Comunicación' },
];
