"use client";

import { useState } from "react";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";

export default function AdminBlogPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredPosts = BLOG_POSTS.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || post.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Blog</h1>
                <Button className="flex items-center gap-2">
                    <Plus size={18} /> Nuevo Artículo
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                            <div className="text-xs text-gray-500">{post.readTime} lectura</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(post.publishedAt).toLocaleDateString('es-MX')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {post.featured ? 'Destacado' : 'Normal'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Eye size={18} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500">Total Artículos</div>
                    <div className="text-2xl font-bold text-gray-900">{BLOG_POSTS.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500">Destacados</div>
                    <div className="text-2xl font-bold text-gray-900">{BLOG_POSTS.filter(p => p.featured).length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500">Categorías</div>
                    <div className="text-2xl font-bold text-gray-900">4</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500">Este Mes</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {BLOG_POSTS.filter(p => new Date(p.publishedAt).getMonth() === new Date().getMonth()).length}
                    </div>
                </div>
            </div>
        </div>
    );
}
