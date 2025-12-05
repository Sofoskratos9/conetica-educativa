"use client";

import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Calendar, Clock, Tag, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPage() {
    const featuredPosts = BLOG_POSTS.filter(p => p.featured);
    const categories = ['Artículos', 'Guías', 'Padres', 'Estrategias'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-[var(--color-brand-900)] to-[var(--color-brand-700)] text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                        <BookOpen size={20} />
                        <span className="text-sm font-medium">Blog Educativo</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-4">Recursos basados en evidencia</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Artículos, guías y estrategias respaldadas por la ciencia para mejorar tu aprendizaje.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Categories Filter */}
                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                    <button className="px-4 py-2 rounded-full bg-[var(--color-brand-600)] text-white font-medium">
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button key={cat} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[var(--color-brand-500)] transition-colors">
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Featured Posts */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos Destacados</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {featuredPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
                                    <div className="p-8 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-sm font-medium">
                                                {post.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock size={14} /> {post.readTime}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-[var(--color-brand-600)] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">{post.excerpt}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(post.publishedAt).toLocaleDateString('es-MX', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <span className="text-[var(--color-brand-600)] font-medium flex items-center gap-1">
                                                Leer más <ArrowRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* All Posts */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Todos los Artículos</h2>
                    <div className="space-y-6">
                        {BLOG_POSTS.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[var(--color-brand-500)] hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                                    {post.category}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock size={12} /> {post.readTime}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-[var(--color-brand-600)] transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(post.publishedAt).toLocaleDateString('es-MX')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Tag size={12} />
                                                    {post.tags[0]}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="text-gray-400 flex-shrink-0" size={20} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
