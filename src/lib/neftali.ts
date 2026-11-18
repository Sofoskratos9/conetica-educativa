/**
 * Nomenclatura NEFTALÍ (fuente única para la copia pública).
 * Gobierna Notion: marca NEFTALÍ, "Pensamiento aplicado a la vida real".
 *
 * Reglas aplicadas aquí:
 * - La sesión de consultoría filosófica es 60 min, $400 MXN IVA incluido,
 *   pago anticipado, cancelación gratuita con 24 h, sin cargo si en los
 *   primeros 15 min se decide derivar. NO es terapia; Miguel no se
 *   presenta como psicólogo. Credencial: Lic. en Filosofía, cédula
 *   profesional 15424282. Maestría ISU solo como "egresado".
 * - CTA solo por DM o Cal.com. Nunca palabra clave.
 * - Sin escasez artificial, sin testimonios ni cifras inventadas.
 * - Los precios de Conética (Premium $299/mes, Mentoría $1,800, Sesión
 *   $500, Vocacional $850, EXANI $2,500) viven en src/lib/products.ts
 *   y NO se cambian aquí: son productos distintos de la sesión NEFTALÍ.
 */

export const NEFTALI_CAL_COM_URL =
  "https://cal.com/miguel-neftali-lopez-wnkrwr/consultoria";

export const NEFTALI_SESSION = {
  name: "Sesión de consultoría filosófica 1:1",
  duration: "60 minutos",
  price: 400,
  priceLabel: "$400 MXN",
  priceNote: "IVA incluido · Pago anticipado",
  cancellation: "Cancelación gratuita con 24 h de anticipación",
  referral:
    "Sin cargo si en los primeros 15 minutos se decide derivar a otro profesional",
  place: "En línea o presencial en Aguascalientes",
  notTherapy: "No es terapia ni coaching",
  credentials: "Lic. en Filosofía, cédula profesional 15424282",
} as const;

export const NEFTALI_DIALOGUES = [
  {
    id: "decision",
    title: "Decisión",
    question: "¿Me quedo o me voy?",
    description:
      "Para quien tiene una decisión difícil enfrente y quiere pensarla bien antes de dar el paso.",
  },
  {
    id: "vocacion",
    title: "Vocación",
    question: "¿A qué me dedico ahora?",
    description:
      "Para pensar el trabajo y la vocación: qué seguir, qué soltar y qué vale la pena sostener.",
  },
  {
    id: "culpa",
    title: "Culpa",
    question: "¿Hice lo correcto?",
    description:
      "Para examinar la culpa sin quedarse atorado en ella: qué es mío, qué no, y qué sigue.",
  },
  {
    id: "muerte",
    title: "Muerte",
    question: "¿Qué hago con lo que se acaba?",
    description:
      "Para pensar la pérdida y la finitud con calma, y ordenar lo que queda por vivir.",
  },
  {
    id: "fe",
    title: "Fe",
    question: "¿En qué creo hoy?",
    description:
      "Para quien sus creencias ya no le alcanzan y quiere volver a pensarlas con honestidad.",
  },
] as const;
