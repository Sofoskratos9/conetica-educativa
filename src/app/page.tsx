"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { InteractivePreview } from "@/components/home/InteractivePreview";
import {
  NEFTALI_CAL_COM_URL,
  NEFTALI_DIALOGUES,
  NEFTALI_SESSION,
} from "@/lib/neftali";
import {
  Brain,
  Target,
  BookOpen,
  Compass,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Award,
  Clock,
  ShieldCheck,
  GraduationCap,
  BarChart3,
  MessageCircle,
} from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      icon: Brain,
      title: "Diagnóstico Académico",
      description:
        "Evalúa tus fortalezas en pensamiento matemático, lectura crítica, atención y autorregulación.",
      href: "/dashboard/diagnostic",
      color: "text-[var(--color-brand-600)]",
      bg: "bg-[var(--color-brand-50)]",
    },
    {
      icon: Target,
      title: "Plan de Estudio Adaptativo",
      description:
        "Agenda semanal con técnica Pomodoro integrada y bloques de repetición espaciada.",
      href: "/dashboard/study-plan",
      color: "text-[var(--color-accent-600)]",
      bg: "bg-[var(--color-accent-50)]",
    },
    {
      icon: BookOpen,
      title: "Simulador EXANI-II & UAA",
      description:
        "Reactivos comentados paso a paso con porcentaje de aciertos y retroalimentación inmediata.",
      href: "/dashboard/exani",
      color: "text-[#5C7A4A]",
      bg: "bg-[#EEF2E6]",
    },
    {
      icon: Compass,
      title: "Orientación Vocacional RIASEC",
      description:
        "Perfil hexagonal de Holland con radar interactivo y compatibilidad con carreras universitarias.",
      href: "/dashboard/vocational",
      color: "text-[#8A6D3B]",
      bg: "bg-[#F3EDE0]",
      image: "/images/neftali/brujula.png",
      imageAlt: "Motivo dibujado a mano: una brújula en acuarela",
    },
    {
      icon: TrendingUp,
      title: "Bienestar y Autorregulación",
      description:
        "Estrategias de manejo del tiempo, claridad y preparación ante exámenes.",
      href: "/dashboard/wellness",
      color: "text-[var(--color-brand-600)]",
      bg: "bg-[var(--color-brand-50)]",
    },
    {
      icon: Users,
      title: "Panel para Familias y Escuelas",
      description:
        "Seguimiento respetuoso de hábitos y consistencia para padres, más talleres para instituciones.",
      href: "/schools",
      color: "text-[var(--color-accent-600)]",
      bg: "bg-[var(--color-accent-50)]",
    },
  ];

  // NOTA: no hay testimonios en esta página. Los anteriores (María
  // González, Carlos Ramírez, Ana Martínez, con cifras como "95%" o
  // "500+ estudiantes") no estaban verificados y se retiraron. Cuando
  // haya testimonios reales con permiso, van aquí.
  const stats = [
    { value: "Ags. + en línea", label: "Aguascalientes y sesiones en línea" },
    { value: "60 min", label: "Sesiones 1:1, académicas y de consultoría" },
    { value: "5 diálogos", label: "Decisión, vocación, culpa, muerte y fe" },
    { value: "Sin promesas", label: "Método y honestidad, sin resultados garantizados" },
  ];

  return (
    <div className="bg-[var(--color-surface-50)]">
      {/* Hero Section — fondo siempre crema (SISTEMA-VISUAL.md §5). */}
      <section className="relative bg-[var(--color-surface-50)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
                <ShieldCheck size={16} />
                <span>Pensamiento aplicado a la vida real · NEFTALÍ</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-brand-900)]">
                Piensa bien antes de <span className="sketch-underline">decidir</span>.
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-xl">
                Diagnóstico académico, simuladores EXANI-II, orientación vocacional y consultoría filosófica para estudiantes, familias e instituciones. Sin falsas promesas: método, calma y honestidad.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/auth/register">
                  <Button size="lg">
                    Crear cuenta gratuita
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    Explorar Servicios
                  </Button>
                </Link>
                <a href={NEFTALI_CAL_COM_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    Agendar sesión NEFTALÍ · $400
                  </Button>
                </a>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-accent-600)]" />
                  Plan gratuito para explorar
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-accent-600)]" />
                  Servicio educativo (no clínico)
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-accent-600)]" />
                  {NEFTALI_SESSION.notTherapy}
                </span>
              </div>
            </motion.div>

            {/* Right Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[12px] overflow-hidden border-2 border-[#14532D] shadow-lg bg-[#FBF8F1]">
                <img
                  src="/images/neftali/heroe-decision.png"
                  alt="Ilustración dibujada a mano: un joven de pelo rizado y suéter verde oscuro piensa ante un camino que se bifurca"
                  className="w-full h-auto object-cover"
                />
                <div className="p-5 bg-[#EFE7D8] border-t-2 border-[#14532D] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--color-brand-900)]">Simulador EXANI-II &amp; Perfil RIASEC</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Alineado a guías de CENEVAL y SEP</div>
                    </div>
                  </div>
                  <Link
                    href="/auth/login"
                    className="text-xs font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] inline-flex items-center gap-1"
                  >
                    Probar Demo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Strip */}
          <div className="mt-14 pt-10 border-t-[3px] border-[#14532D] grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-900)] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FBF8F1] border-b border-[#EFE7D8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 items-center mb-14">
            <div className="lg:col-span-5">
              <div className="rounded-[12px] overflow-hidden border-2 border-[#14532D] shadow-lg">
                <img
                  src="/images/neftali/libro-pregunta.png"
                  alt="Ilustración dibujada a mano: un joven con un libro abierto y una nube de pensamiento"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)] mb-4">
                Pensar con método, sin falsas promesas
              </h2>
              <p className="text-lg text-slate-600">
                Cada herramienta en Conética Educativa está pensada para que estudies y decidas con calma: recuperación activa, práctica espaciada y preguntas bien hechas.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="surface-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-50)] text-[var(--color-accent-600)] flex items-center justify-center mb-5">
                <Award size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Método, no magia</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Metodologías de estudio y guías de CENEVAL y SEP. No prometemos resultados: el avance depende de tu constancia y de tu punto de partida.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center mb-5">
                <Target size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Personalización Real</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tu diagnóstico ajusta las prioridades de estudio, metas semanales y simulacros recomendados.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-[#F3EDE0] text-[#8A6D3B] flex items-center justify-center mb-5">
                <Clock size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transparencia y Ética</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Protección de datos bajo la LFPDPPP, respeto total a tu autonomía y claridad en nuestros alcances: servicio educativo, no clínico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)] mb-3">
                Ecosistema de Módulos Interactivos
              </h2>
              <p className="text-lg text-slate-600">
                Herramientas diseñadas para trabajar juntas desde el primer diagnóstico hasta el día de tu examen.
              </p>
            </div>
            <Link href="/auth/register">
              <Button variant="outline" className="gap-2">
                Crear cuenta gratuita <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <Link key={i} href={mod.href} className="group">
                <div className="surface-card rounded-2xl p-7 h-full flex flex-col">
                  {"image" in mod && mod.image ? (
                    <div className="w-16 h-16 rounded-[12px] overflow-hidden border-2 border-[#14532D] mb-5">
                      <img
                        src={mod.image}
                        alt={mod.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 ${mod.bg} ${mod.color} rounded-xl flex items-center justify-center mb-5`}>
                      <mod.icon size={24} />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">
                    {mod.description}
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-[var(--color-brand-600)]">
                    Abrir módulo
                    <ArrowRight size={15} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Live Sandbox */}
      <InteractivePreview />

      {/* Schools / Institutional Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FBF8F1] border-y border-[#EFE7D8]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="rounded-[12px] overflow-hidden border-2 border-[#14532D] shadow-lg">
              <img
                src="/images/neftali/farol.png"
                alt="Ilustración dibujada a mano: un joven con un farol en un sendero, símbolo de claridad"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-600)]">
              <GraduationCap size={18} />
              <span>Para Colegios y Universidades</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)]">
              Lleva talleres para pensar bien a tu institución
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Talleres presenciales y virtuales sobre pensamiento crítico, proyecto de vida y uso responsable de la inteligencia artificial para docentes y estudiantes en Aguascalientes y todo México.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                "Pensar antes de actuar (Alumnos)",
                "IA Responsable para Docentes",
                "Pensamiento Crítico en el Aula",
                "Proyecto de Vida y Vocación",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                  <CheckCircle size={18} className="text-[var(--color-accent-600)] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link href="/schools">
                <Button size="lg" className="gap-2">
                  Solicitar Propuesta Institucional <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cinco diálogos NEFTALÍ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-600)] mb-3">
              Consultoría filosófica NEFTALÍ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)] mb-3">
              Cinco diálogos para pensar tu vida
            </h2>
            <p className="text-slate-600 text-lg">
              Cuando la decisión no es solo académica, una sesión 1:1 para pensarla bien, con calma y con preguntas honestas. No es terapia ni coaching.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {NEFTALI_DIALOGUES.map((d) => (
              <div key={d.id} className="sketch-card p-6 flex flex-col">
                <div className="text-lg font-bold text-[var(--color-brand-600)] mb-1">{d.title}</div>
                <p className="font-bold text-slate-900 mb-2">&ldquo;{d.question}&rdquo;</p>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">{d.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-3xl mx-auto sketch-card overflow-hidden text-center">
            <img
              src="/images/neftali/conversacion.png"
              alt="Ilustración dibujada a mano: dos personas conversando con calma, con tazas en la mesa"
              className="w-full h-auto object-cover border-b-2 border-[#14532D]"
            />
            <div className="p-7">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {NEFTALI_SESSION.name}
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-4xl font-extrabold text-[var(--color-brand-900)]">{NEFTALI_SESSION.priceLabel}</span>
              <span className="text-slate-500 font-medium">· {NEFTALI_SESSION.duration} · {NEFTALI_SESSION.priceNote}</span>
            </div>
            <p className="text-sm text-slate-600 mb-1">{NEFTALI_SESSION.place}. {NEFTALI_SESSION.cancellation}.</p>
            <p className="text-sm text-slate-600 mb-5">{NEFTALI_SESSION.referral}. {NEFTALI_SESSION.credentials}.</p>
            <a href={NEFTALI_CAL_COM_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <MessageCircle size={18} /> Agendar mi sesión
              </Button>
            </a>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA — sección alterna crema profunda, texto verde. */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EFE7D8]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-5">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-600)]">
              Conética Premium
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)]">
              Todo el ecosistema en un solo lugar
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg">
              Accede a simuladores estilo EXANI-II, tu plan semanal adaptativo y orientación vocacional completa.
            </p>
            <ul className="space-y-2.5 text-sm text-[#14532D]">
              {[
                "Acceso completo a los 6 módulos educativos",
                "Simuladores EXANI-II cronometrados",
                "Reportes detallados de progreso y panel familiar",
                "Cancela cuando quieras, sin plazos forzosos",
              ].map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <CheckCircle size={18} className="text-[var(--color-accent-600)] flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[var(--color-text-muted)] pt-2">
              ¿Tu duda no es académica sino de vida? La sesión de consultoría filosófica NEFTALÍ es aparte: 60 min, $400 MXN IVA incluido, pago anticipado.{" "}
              <a href={NEFTALI_CAL_COM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-brand-700)] underline underline-offset-2">
                Agenda aquí
              </a>
              .
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="bg-[#FBF8F1] text-slate-900 rounded-[12px] border-2 border-[#14532D] p-8 shadow-xl text-center">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Membresía Mensual
              </div>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-extrabold text-[var(--color-brand-900)]">$299</span>
                <span className="text-slate-500 font-medium">MXN/mes</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">Pagos seguros con Stripe y Mercado Pago</p>

              <Link href="/checkout?product=premium_monthly">
                <Button className="w-full py-4 text-base">
                  Suscribirme Ahora <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link
                href="/pricing"
                className="block mt-4 text-xs font-semibold text-[var(--color-brand-600)] hover:underline"
              >
                Comparar plan gratuito vs Premium
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
