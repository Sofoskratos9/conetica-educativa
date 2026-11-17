import { getBlogPost, BLOG_POSTS } from "@/lib/blog-data";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ShareArticleButton } from "@/components/blog/ShareArticleButton";
import React from "react";

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

function renderInlineFormatting(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index} className="font-semibold text-slate-900">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

function SafeArticleContent({ content }: { content: string }) {
    const lines = content.split("\n");
    const blocks: React.ReactNode[] = [];
    let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

    const flushList = (keyPrefix: string) => {
        if (!currentList) return;
        if (currentList.type === "ol") {
            blocks.push(
                <ol key={`${keyPrefix}-ol`} className="list-decimal pl-6 space-y-2 my-4 text-slate-700 leading-relaxed">
                    {currentList.items.map((item, idx) => (
                        <li key={idx}>{renderInlineFormatting(item)}</li>
                    ))}
                </ol>
            );
        } else {
            blocks.push(
                <ul key={`${keyPrefix}-ul`} className="list-disc pl-6 space-y-2 my-4 text-slate-700 leading-relaxed">
                    {currentList.items.map((item, idx) => (
                        <li key={idx}>{renderInlineFormatting(item)}</li>
                    ))}
                </ul>
            );
        }
        currentList = null;
    };

    lines.forEach((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
            flushList(`empty-${index}`);
            return;
        }

        if (line.startsWith("## ")) {
            flushList(`h2-${index}`);
            blocks.push(
                <h2 key={`h2-${index}`} className="text-2xl font-bold text-slate-900 mt-8 mb-3">
                    {line.slice(3)}
                </h2>
            );
            return;
        }

        if (line.startsWith("# ")) {
            flushList(`h1-${index}`);
            blocks.push(
                <h2 key={`h1-${index}`} className="text-2xl md:text-3xl font-bold text-[var(--color-brand-900)] mt-4 mb-4">
                    {line.slice(2)}
                </h2>
            );
            return;
        }

        if (line.startsWith("- ")) {
            if (currentList && currentList.type !== "ul") {
                flushList(`switch-ul-${index}`);
            }
            if (!currentList) currentList = { type: "ul", items: [] };
            currentList.items.push(line.slice(2));
            return;
        }

        const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
        if (orderedMatch) {
            if (currentList && currentList.type !== "ol") {
                flushList(`switch-ol-${index}`);
            }
            if (!currentList) currentList = { type: "ol", items: [] };
            currentList.items.push(orderedMatch[1]);
            return;
        }

        flushList(`p-${index}`);
        blocks.push(
            <p key={`p-${index}`} className="text-slate-700 leading-relaxed my-4 text-base md:text-lg">
                {renderInlineFormatting(line)}
            </p>
        );
    });

    flushList("end");

    return <div>{blocks}</div>;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)]">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[var(--color-brand-600)] font-medium hover:underline mb-8 text-sm"
                >
                    <ArrowLeft size={16} /> Volver al Blog
                </Link>

                <article className="surface-card p-6 sm:p-10">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-xs font-semibold">
                                {post.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={14} /> {post.readTime} de lectura
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pb-6 border-b border-slate-100">
                            <span className="flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(post.publishedAt).toLocaleDateString("es-MX", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            <span>Por <strong className="text-slate-700">{post.author}</strong></span>
                        </div>
                    </div>

                    {/* XSS-safe formatted content */}
                    <div className="mb-8">
                        <SafeArticleContent content={post.content} />
                    </div>

                    {/* Tags */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag size={16} className="text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">Etiquetas:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Share */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-slate-600">
                            ¿Te resultó útil? Compártelo con alguien que lo necesite.
                        </span>
                        <ShareArticleButton title={post.title} />
                    </div>
                </article>

                {/* Related Posts */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">También te puede interesar</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {relatedPosts.map((relatedPost) => (
                            <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
                                <div className="surface-card p-6 hover:border-[var(--color-brand-500)] hover:shadow-md transition-all h-full">
                                    <span className="text-xs font-semibold text-[var(--color-brand-600)] mb-2 block">
                                        {relatedPost.category}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                                        {relatedPost.title}
                                    </h3>
                                    <p className="text-sm text-slate-600">{relatedPost.excerpt}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
