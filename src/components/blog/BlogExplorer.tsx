"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-data";
import { Calendar, Clock, Tag, ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";

const CATEGORIES = ["Todos", "Artículos", "Guías", "Padres", "Estrategias"] as const;

export function BlogExplorer({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
            const query = searchQuery.trim().toLowerCase();
            const matchesQuery =
                !query ||
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some((tag) => tag.toLowerCase().includes(query));
            return matchesCategory && matchesQuery;
        });
    }, [initialPosts, selectedCategory, searchQuery]);

    const featuredPosts = useMemo(
        () => filteredPosts.filter((p) => p.featured),
        [filteredPosts]
    );

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)]">
            <div className="gradient-brand text-white py-20 px-4 relative overflow-hidden">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full mb-6 text-sm font-medium">
                        <BookOpen size={18} className="text-emerald-300" />
                        <span>Blog Educativo Conética</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Recursos para estudiar mejor
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        Artículos, guías de admisión EXANI-II y estrategias respaldadas por la ciencia cognitiva para transformar tu estudio.
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar artículos por tema, etiqueta o palabra clave..."
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-14">
                <div className="flex flex-wrap gap-2.5 mb-12 justify-center">
                    {CATEGORIES.map((cat) => {
                        const active = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                                    active
                                        ? "bg-[var(--color-brand-600)] text-white shadow-sm"
                                        : "bg-white border border-slate-200 text-slate-700 hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)]"
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {filteredPosts.length === 0 ? (
                    <div className="surface-card p-12 text-center max-w-xl mx-auto">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Sin resultados</h2>
                        <p className="text-slate-500 mb-6 text-sm">
                            No encontramos artículos que coincidan con tu búsqueda o categoría seleccionada.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory("Todos");
                                setSearchQuery("");
                            }}
                            className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
                        >
                            Ver todos los artículos
                        </button>
                    </div>
                ) : (
                    <>
                        {featuredPosts.length > 0 && (
                            <div className="mb-14">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Sparkles size={20} className="text-[var(--color-brand-600)]" />
                                    Artículos Destacados
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {featuredPosts.map((post) => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                                            <div className="surface-card p-7 h-full flex flex-col hover:border-[var(--color-brand-500)] hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="px-3 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-xs font-semibold">
                                                        {post.category}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock size={14} /> {post.readTime}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-brand-600)] transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                                                    {post.excerpt}
                                                </p>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Calendar size={14} />
                                                        {new Date(post.publishedAt).toLocaleDateString("es-MX", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </div>
                                                    <span className="text-[var(--color-brand-600)] text-sm font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                                        Leer más <ArrowRight size={16} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                {selectedCategory === "Todos" ? "Todos los Artículos" : `Categoría: ${selectedCategory}`}
                            </h2>
                            <div className="space-y-4">
                                {filteredPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                                        <div className="surface-card p-6 hover:border-[var(--color-brand-500)] hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                                            {post.category}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Clock size={12} /> {post.readTime}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-slate-600 text-sm mb-3">{post.excerpt}</p>
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(post.publishedAt).toLocaleDateString("es-MX")}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Tag size={12} />
                                                            {post.tags.join(" · ")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight
                                                    className="text-slate-400 group-hover:text-[var(--color-brand-600)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                                                    size={20}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
