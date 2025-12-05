"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Brain,
  Target,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Zap
} from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      icon: Brain,
      title: "Diagnóstico Cognitivo-Académico",
      description: "Identifica tus fortalezas y áreas de oportunidad con evaluaciones científicamente validadas.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: Target,
      title: "Plan de Estudio Personalizado",
      description: "Estrategias adaptadas a tu perfil cognitivo y objetivos académicos específicos.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      icon: BookOpen,
      title: "Preparación EXANI-UAA",
      description: "Simuladores, reactivos y estrategias probadas para maximizar tu puntaje de admisión.",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: Lightbulb,
      title: "Orientación Vocacional",
      description: "Descubre tu perfil RIASEC y las carreras que mejor se alinean con tus intereses.",
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      icon: TrendingUp,
      title: "Manejo de Estrés Académico",
      description: "Técnicas de autorregulación y organización basadas en neurociencia aplicada.",
      color: "text-pink-600",
      bg: "bg-pink-50"
    },
    {
      icon: Users,
      title: "Estrategias Digitales",
      description: "Aprovecha herramientas tecnológicas para optimizar tu aprendizaje y productividad.",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Estudiante UAA - Ingeniería",
      content: "Gracias a Conética mejoré mi puntaje en el EXANI-II en 15 puntos. El diagnóstico personalizado fue clave.",
      rating: 5
    },
    {
      name: "Carlos Ramírez",
      role: "Padre de Familia",
      content: "El panel para padres me permite dar seguimiento al progreso de mi hijo sin presionarlo. Excelente herramienta.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Estudiante - Medicina",
      content: "La orientación vocacional me ayudó a confirmar mi decisión de estudiar medicina. Muy recomendable.",
      rating: 5
    }
  ];

  const stats = [
    { value: "95%", label: "Tasa de admisión" },
    { value: "500+", label: "Estudiantes activos" },
    { value: "4.9/5", label: "Calificación promedio" },
    { value: "100%", label: "Basado en evidencia" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-brand text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">Plataforma educativa basada en evidencia científica</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Conética Educativa™
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Transforma tu aprendizaje con estrategias personalizadas, diagnósticos científicos y acompañamiento profesional.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button className="bg-white text-[var(--color-brand-900)] hover:bg-gray-100 px-8 py-6 text-lg">
                  <Zap size={20} className="mr-2" /> Comenzar Gratis
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                  Ver Servicios <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué Conética Educativa?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combinamos neurociencia, pedagogía y tecnología para maximizar tu potencial académico.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Award className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Basado en Evidencia</h3>
              <p className="text-gray-600">
                Todas nuestras estrategias están respaldadas por investigación científica verificable.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Target className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Personalización Total</h3>
              <p className="text-gray-600">
                Diagnósticos individuales y planes adaptados a tu perfil cognitivo único.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Resultados Comprobados</h3>
              <p className="text-gray-600">
                95% de nuestros estudiantes logran admisión en su primera opción.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Módulos Educativos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Accede a un ecosistema completo de herramientas para tu desarrollo académico.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${module.bg} rounded-xl mb-4`}>
                  <module.icon className={module.color} size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm">{module.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register">
              <Button className="px-8 py-4 text-lg gradient-accent text-white">
                Explorar Módulos Gratis <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros estudiantes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Paid Services */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Necesitas acompañamiento personalizado?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Agenda sesiones 1:1 con nuestros expertos o adquiere programas completos de preparación.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Ver Servicios y Precios
              </Button>
            </Link>
            <Link href="/dashboard/booking">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Agendar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Subscription */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full mb-4">
                <Star size={16} className="text-green-400" />
                <span className="text-sm font-medium text-green-400">Conética Premium</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Desbloquea todo el potencial de la plataforma
              </h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Acceso ilimitado a todos los módulos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Simuladores de examen sin límite</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Recomendaciones personalizadas con IA</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Soporte prioritario 24/7</span>
                </li>
              </ul>
            </div>
            <div className="bg-white text-gray-900 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold mb-2">$299</div>
              <div className="text-gray-500 mb-6">MXN/mes</div>
              <Link href="/checkout?product=premium_monthly">
                <Button className="w-full gradient-accent text-white py-4 text-lg">
                  Suscribirme Ahora
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-4">Cancela cuando quieras</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comienza tu transformación académica hoy
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a cientos de estudiantes que ya están alcanzando sus metas con Conética Educativa™
          </p>
          <Link href="/auth/register">
            <Button className="px-12 py-6 text-xl gradient-brand text-white">
              Registrarse Gratis <ArrowRight size={24} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
