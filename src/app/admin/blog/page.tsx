"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS, type BlogPost } from "@/lib/blog-data";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, Eye, Search, X } from "lucide-react";

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formCategory, setFormCategory] = useState<BlogPost["category"]>("Artículos");
    const [formExcerpt, setFormExcerpt] = useState("");
    const [formFeatured, setFormFeatured] = useState(false);

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || post.category === filter;
        return matchesSearch && matchesFilter;
    });

    const openCreateModal = () => {
        setEditingPost(null);
        setFormTitle("");
        setFormCategory("Artículos");
        setFormExcerpt("");
        setFormFeatured(false);
        setIsCreating(true);
    };

    const openEditModal = (post: BlogPost) => {
        setIsCreating(false);
        setEditingPost(post);
        setFormTitle(post.title);
        setFormCategory(post.category);
        setFormExcerpt(post.excerpt);
        setFormFeatured(post.featured);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        if (editingPost) {
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === editingPost.id
                        ? {
                              ...p,
                              title: formTitle.trim(),
                              category: formCategory,
                              excerpt: formExcerpt.trim() || p.excerpt,
                              featured: formFeatured,
                          }
                        : p
                )
            );
            setEditingPost(null);
        } else {
            const slug = formTitle
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
            const newPost: BlogPost = {
                id: String(Date.now()),
                slug: slug || `articulo-${Date.now()}`,
                title: formTitle.trim(),
                excerpt: formExcerpt.trim() || "Nuevo recurso educativo de Conética.",
                content: `# ${formTitle.trim()}\n\n${formExcerpt.trim()}`,
                category: formCategory,
                author: "Equipo Conética",
                publishedAt: new Date().toISOString().split("T")[0],
                readTime: "4 min",
                tags: [formCategory],
                featured: formFeatured,
            };
            setPosts((prev) => [newPost, ...prev]);
            setIsCreating(false);
        }
    };

    const handleDelete = (id: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Blog</h1>
                    <p className="text-sm text-slate-500">Administra, edita y destaca artículos del blog educativo.</p>
                </div>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                    <Plus size={18} /> Nuevo Artículo
                </Button>
            </div>

            {/* Filters */}
            <div className="surface-card p-5">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none text-sm"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none text-sm bg-white"
                    >
                        <option value="all">Todas las categorías</option>
                        <option value="Artículos">Artículos</option>
                        <option value="Guías">Guías</option>
                        <option value="Padres">Padres</option>
                        <option value="Estrategias">Estrategias</option>
                    </select>
                </div>
            </div>

            {/* Posts Table */}
            <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-900">{post.title}</div>
                                        <div className="text-xs text-slate-500">{post.readTime} de lectura</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(post.publishedAt).toLocaleDateString("es-MX")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                post.featured ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {post.featured ? "Destacado" : "Normal"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                title="Ver artículo"
                                                className="p-1.5 rounded-lg text-[var(--color-brand-600)] hover:bg-blue-50"
                                            >
                                                <Eye size={17} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(post)}
                                                title="Editar artículo"
                                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                                            >
                                                <Edit size={17} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(post.id)}
                                                title="Eliminar artículo"
                                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Total Artículos</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{posts.length}</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Destacados</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{posts.filter((p) => p.featured).length}</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Categorías</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">4</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Publicados</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{posts.length}</div>
                </div>
            </div>

            {(isCreating || editingPost) && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSave}
                        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingPost ? "Editar Artículo" : "Nuevo Artículo"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingPost(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                            <input
                                type="text"
                                required
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                            <select
                                value={formCategory}
                                onChange={(e) => setFormCategory(e.target.value as BlogPost["category"])}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            >
                                <option value="Artículos">Artículos</option>
                                <option value="Guías">Guías</option>
                                <option value="Padres">Padres</option>
                                <option value="Estrategias">Estrategias</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Resumen</label>
                            <textarea
                                rows={3}
                                value={formExcerpt}
                                onChange={(e) => setFormExcerpt(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={formFeatured}
                                onChange={(e) => setFormFeatured(e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            Marcar como artículo destacado
                        </label>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingPost(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
