"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-data";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, Eye, Search, X, RefreshCw } from "lucide-react";

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formCategory, setFormCategory] = useState<BlogPost["category"]>("Artículos");
    const [formExcerpt, setFormExcerpt] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formReadTime, setFormReadTime] = useState("5 min");
    const [formFeatured, setFormFeatured] = useState(false);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/blog");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudieron cargar los artículos.");
                return;
            }
            setPosts(data.posts || []);
        } catch {
            setErrorMessage("Error de conexión al cargar artículos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

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
        setFormContent("");
        setFormReadTime("5 min");
        setFormFeatured(false);
        setErrorMessage("");
        setIsCreating(true);
    };

    const openEditModal = (post: BlogPost) => {
        setIsCreating(false);
        setEditingPost(post);
        setFormTitle(post.title);
        setFormCategory(post.category);
        setFormExcerpt(post.excerpt);
        setFormContent(post.content);
        setFormReadTime(post.readTime || "5 min");
        setFormFeatured(post.featured);
        setErrorMessage("");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formExcerpt.trim()) return;
        setSaving(true);
        setErrorMessage("");

        try {
            if (editingPost) {
                const res = await fetch("/api/blog", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: editingPost.id,
                        title: formTitle.trim(),
                        category: formCategory,
                        excerpt: formExcerpt.trim(),
                        content: formContent.trim() || editingPost.content,
                        readTime: formReadTime.trim() || "5 min",
                        featured: formFeatured,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setErrorMessage(data.error || "No se pudo actualizar el artículo.");
                    return;
                }
                if (data.post) {
                    setPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
                }
                setEditingPost(null);
            } else {
                const res = await fetch("/api/blog", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: formTitle.trim(),
                        category: formCategory,
                        excerpt: formExcerpt.trim(),
                        content: formContent.trim() || `# ${formTitle.trim()}\n\n${formExcerpt.trim()}`,
                        readTime: formReadTime.trim() || "5 min",
                        featured: formFeatured,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setErrorMessage(data.error || "No se pudo publicar el artículo.");
                    return;
                }
                if (data.post) {
                    setPosts((prev) => [data.post, ...prev]);
                }
                setIsCreating(false);
            }
        } catch {
            setErrorMessage("Error de conexión al guardar el artículo.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setErrorMessage("");
        const prev = posts;
        setPosts((curr) => curr.filter((p) => p.id !== id));
        try {
            const res = await fetch(`/api/blog?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setPosts(prev);
                setErrorMessage(data.error || "No se pudo eliminar el artículo.");
            }
        } catch {
            setPosts(prev);
            setErrorMessage("Error de conexión al eliminar el artículo.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Blog</h1>
                    <p className="text-sm text-slate-500">Publica, edita y destaca artículos guardados en base de datos.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadPosts} disabled={loading}>
                        <RefreshCw size={16} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
                    </Button>
                    <Button onClick={openCreateModal} className="flex items-center gap-2">
                        <Plus size={18} /> Nuevo Artículo
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        Cargando artículos...
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No hay artículos en esta búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
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
                                ))
                            )}
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
                    <div className="text-xs text-slate-500">Categorías Activas</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                        {new Set(posts.map((p) => p.category)).size}
                    </div>
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
                        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
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
                                minLength={3}
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo de lectura</label>
                                <input
                                    type="text"
                                    value={formReadTime}
                                    onChange={(e) => setFormReadTime(e.target.value)}
                                    placeholder="Ej: 5 min"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Resumen</label>
                            <textarea
                                required
                                minLength={5}
                                rows={2}
                                value={formExcerpt}
                                onChange={(e) => setFormExcerpt(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Contenido completo (admite títulos con ## y listas con -)
                            </label>
                            <textarea
                                rows={6}
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                placeholder="Escribe el artículo completo..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
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
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
