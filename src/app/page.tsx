"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { InteractivePreview } from "@/components/home/InteractivePreview";
import {
  Brain,
  Target,
  BookOpen,
  Compass,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Award,
  Clock,
  ShieldCheck,
  GraduationCap,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      icon: Brain,
      title: "Diagnóstico Cognitivo-Académico",
      description:
        "Evalúa tus fortalezas en pensamiento matemático, lectura crítica, atención ejecutiva y autorregulación.",
      href: "/dashboard/diagnostic",
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      icon: Target,
      title: "Plan de Estudio Adaptativo",
      description:
        "Agenda semanal inteligente con técnica Pomodoro integrada y bloques de repetición espaciada.",
      href: "/dashboard/study-plan",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      icon: BookOpen,
      title: "Simulador EXANI-II & UAA",
      description:
        "Reactivos comentados paso a paso con escala CENEVAL (700–1300) y retroalimentación inmediata.",
      href: "/dashboard/exani",
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      icon: Compass,
      title: "Orientación Vocacional RIASEC",
      description:
        "Perfil hexagonal de Holland con radar interactivo y compatibilidad con carreras universitarias.",
      href: "/dashboard/vocational",
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      icon: TrendingUp,
      title: "Bienestar y Autorregulación",
      description:
        "Protocolos no clínicos de manejo del tiempo, claridad cognitiva y preparación ante exámenes.",
      href: "/dashboard/wellness",
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      icon: Users,
      title: "Panel para Familias y Escuelas",
      description:
        "Seguimiento respetuoso de hábitos y consistencia para padres, más talleres para instituciones.",
      href: "/schools",
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Estudiante UAA • Ingeniería",
      content:
        "Gracias a Conética mejoré mi puntaje en el EXANI-II en 15 puntos porcentuales. El diagnóstico inicial me mostró exactamente qué repasar.",
      rating: 5,
    },
    {
      name: "Carlos Ramírez",
      role: "Padre de Familia • Aguascalientes",
      content:
        "El panel familiar me permite acompañar la constancia de mi hijo sin presionarlo ni invadir su autonomía.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      role: "Estudiante • Medicina",
      content:
        "El perfil RIASEC y la asesoría vocacional me dieron claridad total antes de presentar mi examen de admisión.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "95%", label: "Tasa de admisión en primera opción" },
    { value: "500+", label: "Estudiantes activos en Aguascalientes" },
    { value: "4.9/5", label: "Satisfacción de estudiantes y familias" },
    { value: "100%", label: "Metodologías basadas en evidencia" },
  ];

  return (
    <div className="bg-[var(--color-surface-50)]">
      {/* Hero Section */}
      <section className="relative gradient-brand text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                <ShieldCheck size={16} />
                <span>Plataforma Educativa Basada en Evidencia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                Aprende con método científico, alcanza tu admisión universitaria.
              </h1>

              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-xl">
                Diagnóstico cognitivo-académico, simuladores EXANI-II, orientación vocacional RIASEC y acompañamiento ético para estudiantes, familias e instituciones.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/30"
                  >
                    Comenzar Gratis
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white"
                  >
                    Explorar Servicios
                  </Button>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  Plan gratuito robusto
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  Servicio educativo (no clínico)
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
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900/40">
                <img
                  src="/images/hero-illustration.jpg"
                  alt="Ilustración editorial de aprendizaje científico, neurociencia aplicada y orientación académica en Conética Educativa"
                  className="w-full h-auto object-cover"
                />
                <div className="p-5 bg-slate-950/85 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Simulador EXANI-II &amp; Perfil RIASEC</div>
                      <div className="text-xs text-slate-300">Alineado a CENEVAL, SEP, OCDE y UNESCO</div>
                    </div>
                  </div>
                  <Link
                    href="/auth/login"
                    className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
                  >
                    Probar Demo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Strip */}
          <div className="mt-14 pt-10 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)] mb-4">
              Ciencia cognitiva aplicada, sin pseudociencia ni falsas promesas
            </h2>
            <p className="text-lg text-slate-600">
              Cada herramienta en Conética Educativa™ está fundamentada en investigación verificable sobre recuperación activa, práctica espaciada y funciones ejecutivas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="surface-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                <Award size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Basado en Evidencia</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Metodologías respaldadas por guías de CENEVAL, SEP, OCDE y literatura peer-reviewed en psicología educativa y neurociencia.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                <Target size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Personalización Real</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tu diagnóstico ajusta automáticamente las prioridades de estudio, metas semanales y simulacros recomendados.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
                <Clock size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transparencia y Ética</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Protección estricta de datos bajo la LFPDPPP, respeto total a la autonomía del estudiante y claridad en nuestros alcances no clínicos.
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
                  <div className={`w-12 h-12 ${mod.bg} ${mod.color} rounded-xl flex items-center justify-center mb-5`}>
                    <mod.icon size={24} />
                  </div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
              <img
                src="/images/schools-illustration.jpg"
                alt="Talleres colaborativos y pensamiento crítico para escuelas e instituciones educativas"
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
              Lleva metodologías de alto impacto a tu institución
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Impartimos talleres presenciales y virtuales sobre funciones ejecutivas, pensamiento crítico, proyecto de vida e inteligencia artificial ética para docentes en Aguascalientes y todo México.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                "Pensar antes de actuar (Alumnos)",
                "IA Responsable para Docentes",
                "Pensamiento Crítico en el Aula",
                "Proyecto de Vida y Vocación",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                  <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
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

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-900)] mb-3">
              Resultados respaldados por nuestra comunidad
            </h2>
            <p className="text-slate-600 text-lg">
              Estudiantes y familias que transformaron su forma de estudiar y decidir su futuro profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="surface-card rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-brand text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-5">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Conética Premium
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Desbloquea todo el ecosistema sin límites
            </h2>
            <p className="text-slate-200 text-lg">
              Accede a simuladores ilimitados estilo EXANI-II, tu plan semanal adaptativo y orientación vocacional completa.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-100">
              {[
                "Acceso completo a los 6 módulos educativos",
                "Simuladores EXANI-II cronometrados e ilimitados",
                "Reportes detallados de progreso y panel familiar",
                "Cancela cuando quieras, sin plazos forzosos",
              ].map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl text-center">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Membresía Mensual
              </div>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-extrabold text-[var(--color-brand-900)]">$299</span>
                <span className="text-slate-500 font-medium">MXN/mes</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">Pagos seguros con Stripe y Mercado Pago</p>

              <Link href="/checkout?product=premium_monthly">
                <Button className="w-full py-4 text-base gradient-accent text-white font-bold">
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
