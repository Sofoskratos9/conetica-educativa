export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: 'Artículos' | 'Guías' | 'Padres' | 'Estrategias';
    author: string;
    publishedAt: string;
    readTime: string;
    tags: string[];
    featured: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'tecnica-pomodoro-estudiantes',
        title: 'La Técnica Pomodoro: Cómo estudiar con máxima concentración',
        excerpt: 'Descubre cómo esta técnica basada en intervalos puede triplicar tu productividad de estudio.',
        content: `# La Técnica Pomodoro para Estudiantes

La Técnica Pomodoro es un método de gestión del tiempo desarrollado por Francesco Cirillo a finales de los años 80. Su nombre proviene del temporizador de cocina con forma de tomate que Cirillo usaba.

## ¿Cómo funciona?

1. **Elige una tarea** que quieras completar
2. **Configura un temporizador** por 25 minutos
3. **Trabaja sin distracciones** hasta que suene
4. **Toma un descanso** de 5 minutos
5. **Repite el ciclo** 4 veces, luego toma un descanso largo de 15-30 minutos

## Beneficios científicamente comprobados

- Mejora la concentración sostenida
- Reduce la fatiga mental
- Aumenta la motivación intrínseca
- Facilita el seguimiento del progreso

## Adaptaciones para estudiantes

Para materias complejas como matemáticas, considera ciclos de 50 minutos con descansos de 10 minutos.`,
        category: 'Estrategias',
        author: 'Miguel Neftalí López',
        publishedAt: '2025-12-01',
        readTime: '5 min',
        tags: ['Productividad', 'Concentración', 'Técnicas de estudio'],
        featured: true
    },
    {
        id: '2',
        slug: 'como-apoyar-hijo-examen-admision',
        title: 'Cómo apoyar a tu hijo durante la preparación para el examen de admisión',
        excerpt: 'Guía práctica para padres: estrategias efectivas sin generar presión adicional.',
        content: `# Apoyo familiar en la preparación del EXANI-II

La preparación para un examen de admisión es un proceso estresante. Como padre, tu rol es crucial pero debe ser equilibrado.

## Qué SÍ hacer

- Crear un espacio de estudio tranquilo
- Respetar los horarios de descanso
- Mostrar interés genuino sin presionar
- Celebrar pequeños avances

## Qué NO hacer

- Comparar con otros estudiantes
- Minimizar sus preocupaciones
- Interrumpir constantemente
- Proyectar tus propias ansiedades

## Señales de alerta

Si notas cambios drásticos en el sueño, apetito o estado de ánimo, considera buscar apoyo profesional.`,
        category: 'Padres',
        author: 'Miguel Neftalí López',
        publishedAt: '2025-11-28',
        readTime: '7 min',
        tags: ['Padres', 'EXANI-II', 'Apoyo familiar'],
        featured: true
    },
    {
        id: '3',
        slug: 'neurociencia-aprendizaje-efectivo',
        title: 'Neurociencia del aprendizaje: Por qué funciona la repetición espaciada',
        excerpt: 'La ciencia detrás de una de las técnicas de estudio más efectivas según la investigación.',
        content: `# La Repetición Espaciada según la Neurociencia

La repetición espaciada es una técnica de aprendizaje que distribuye las sesiones de estudio a lo largo del tiempo.

## Base científica

Estudios de neuroimagen muestran que:
- La consolidación de memoria requiere tiempo
- El olvido controlado fortalece las conexiones neuronales
- El esfuerzo de recuperación mejora la retención a largo plazo

## Implementación práctica

1. Estudia el material nuevo
2. Revísalo después de 1 día
3. Luego después de 3 días
4. Después de 1 semana
5. Finalmente después de 1 mes

## Herramientas recomendadas

- Anki (flashcards digitales)
- Quizlet
- Notion con sistema de revisión`,
        category: 'Artículos',
        author: 'Miguel Neftalí López',
        publishedAt: '2025-11-25',
        readTime: '6 min',
        tags: ['Neurociencia', 'Memoria', 'Técnicas de estudio'],
        featured: false
    },
    {
        id: '4',
        slug: 'guia-completa-exani-ii-2026',
        title: 'Guía Completa EXANI-II 2026: Todo lo que necesitas saber',
        excerpt: 'Estructura del examen, temas clave, estrategias de preparación y calendario oficial.',
        content: `# Guía Completa EXANI-II 2026

El EXANI-II es el examen de admisión más importante para ingresar a la UAA y otras universidades públicas.

## Estructura del examen

- **Pensamiento Matemático**: 30 reactivos
- **Pensamiento Analítico**: 30 reactivos  
- **Estructura de la Lengua**: 30 reactivos
- **Comprensión Lectora**: 30 reactivos

Total: 120 reactivos en 3 horas

## Calendario 2026

- Convocatoria: Enero 2026
- Registro: Febrero-Marzo
- Examen: Abril 2026
- Resultados: Mayo 2026

## Estrategia de preparación

1. Diagnóstico inicial (mes 1)
2. Fortalecimiento de áreas débiles (meses 2-3)
3. Simulacros semanales (mes 4)
4. Repaso final (última semana)`,
        category: 'Guías',
        author: 'Miguel Neftalí López',
        publishedAt: '2025-11-20',
        readTime: '10 min',
        tags: ['EXANI-II', 'UAA', 'Admisión'],
        featured: true
    }
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(post => post.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
    return BLOG_POSTS.filter(post => post.category === category);
}
