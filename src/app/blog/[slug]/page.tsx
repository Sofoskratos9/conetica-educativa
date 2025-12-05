import { getBlogPost, BLOG_POSTS } from "@/lib/blog-data";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = getBlogPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--color-brand-600)] hover:underline mb-8">
                    <ArrowLeft size={16} /> Volver al Blog
                </Link>

                <article className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-sm font-medium">
                                {post.category}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock size={14} /> {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

                        <div className="flex items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-100">
                            <span className="flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(post.publishedAt).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span>Por {post.author}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none mb-8">
                        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
                    </div>

                    {/* Tags */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Etiquetas:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Share */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Compartir artículo:</span>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                            <Share2 size={16} /> Compartir
                        </button>
                    </div>
                </article>

                {/* Related Posts */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos Relacionados</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category).slice(0, 2).map((relatedPost) => (
                            <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[var(--color-brand-500)] hover:shadow-md transition-all">
                                    <span className="text-xs text-gray-500 mb-2 block">{relatedPost.category}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-[var(--color-brand-600)]">
                                        {relatedPost.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{relatedPost.excerpt}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
