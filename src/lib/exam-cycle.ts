// Ported from Sofoskratos9/MiguelBot- (shared/examCycle.ts, shared/examSources.ts & UAA_CAREERS)

export interface UaaCycleContext {
    isoDate: string;
    currentYear: number;
    monthNumber: number;
    dayNumber: number;
    monthName: string;
    monthTitle: string;
    editionMonthYear: string;
    targetAdmissionYear: number;
    editionLabel: string;
    shortCycleTag: string;
    uaaPhaseLabel: string;
}

export interface UaaCareerTarget {
    id: string;
    label: string;
    targetScore: number;
    note: string;
}

export const UAA_CAREERS: UaaCareerTarget[] = [
    {
        id: 'medicina',
        label: 'Médico Cirujano (Alta demanda)',
        targetScore: 1160,
        note: 'Competencia muy alta en UAA; se recomienda 85%+ en módulos específicos.',
    },
    {
        id: 'estomatologia',
        label: 'Estomatología / Nutrición / Enfermería',
        targetScore: 1080,
        note: 'Demanda media-alta en Ciencias de la Salud.',
    },
    {
        id: 'psicologia',
        label: 'Psicología / Derecho / Comunicación',
        targetScore: 1030,
        note: 'Demanda media-alta en Ciencias Sociales y Humanidades.',
    },
    {
        id: 'ingenierias',
        label: 'Ingenierías / Arquitectura / Diseño',
        targetScore: 990,
        note: 'Mayor peso práctico en Pensamiento Matemático y Analítico.',
    },
    {
        id: 'admin',
        label: 'Administración / Contaduría / Mercadotecnia',
        targetScore: 950,
        note: 'Puntaje competitivo promedio UAA.',
    },
];

export const EXAM_SOURCES_INFO = {
    cenevalDuration: '4 horas 30 minutos (1 sesión)',
    scale: '700 a 1,300 puntos CENEVAL',
    uaaWeighting: 'Referencia institucional UAA: 70% puntaje EXANI-II + 30% promedio general de bachillerato.',
    typicalWindow: 'Convocatoria anual UAA: publicación febrero · registro marzo · examen mayo · resultados junio.',
    officialUrls: {
        cenevalExaniII: 'https://ceneval.edu.mx/examenes-ingreso-exani_ii/',
        cenevalGuias: 'https://guias.ceneval.edu.mx/exani-ii/',
        uaaAspirantes: 'https://www.uaa.mx/portal/aspirantes/',
    },
};

const MONTHS_ES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
] as const;

const capitalize = (text: string): string =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

export const getMexicoCityDateParts = (now: Date = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.formatToParts(now);
    const year = Number(parts.find((p) => p.type === 'year')?.value || now.getUTCFullYear());
    const month = Number(parts.find((p) => p.type === 'month')?.value || now.getUTCMonth() + 1);
    const day = Number(parts.find((p) => p.type === 'day')?.value || now.getUTCDate());
    return { year, month, day };
};

export const getUaaCycleContext = (now: Date = new Date()): UaaCycleContext => {
    const { year, month, day } = getMexicoCityDateParts(now);
    const safeMonth = Math.min(12, Math.max(1, month));
    const monthName = MONTHS_ES[safeMonth - 1];
    const monthTitle = capitalize(monthName);

    const targetAdmissionYear = safeMonth >= 8 ? year + 1 : year;

    let uaaPhaseLabel: string;
    if (safeMonth >= 2 && safeMonth <= 3) {
        uaaPhaseLabel = `Ventana de Convocatoria y Prerregistro UAA ${targetAdmissionYear}`;
    } else if (safeMonth >= 4 && safeMonth <= 5) {
        uaaPhaseLabel = `Recta Final Pre-Examen EXANI-II UAA ${targetAdmissionYear}`;
    } else if (safeMonth >= 6 && safeMonth <= 7) {
        uaaPhaseLabel = `Publicación de Resultados UAA ${targetAdmissionYear} y Diagnóstico Temprano`;
    } else {
        uaaPhaseLabel = `Preparación Anticipada Rumbo a Admisión UAA ${targetAdmissionYear}`;
    }

    const mm = String(safeMonth).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    return {
        isoDate: `${year}-${mm}-${dd}`,
        currentYear: year,
        monthNumber: safeMonth,
        dayNumber: day,
        monthName,
        monthTitle,
        editionMonthYear: `${monthTitle} ${year}`,
        targetAdmissionYear,
        editionLabel: `Edición ${monthTitle} ${year} · Admisión UAA ${targetAdmissionYear}`,
        shortCycleTag: `UAA ${targetAdmissionYear}`,
        uaaPhaseLabel,
    };
};
