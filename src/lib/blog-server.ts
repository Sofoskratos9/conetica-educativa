import { BLOG_POSTS, type BlogPost } from './blog-data';
import { ensurePostgresSchema, getDatabaseMode, getPgPool } from './db';

const globalForBlog = globalThis as unknown as {
    __coneticaBlogSeeded?: boolean;
};

async function seedInitialBlogPostsIfEmpty(): Promise<void> {
    if (globalForBlog.__coneticaBlogSeeded) return;
    const pool = getPgPool();
    if (!pool) return;

    const countRes = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM blog_posts');
    const count = Number(countRes.rows[0]?.count || '0');

    if (count === 0) {
        for (const post of BLOG_POSTS) {
            await pool.query(
                `INSERT INTO blog_posts (slug, title, excerpt, content, category, author, read_time, tags, featured, published_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (slug) DO NOTHING`,
                [
                    post.slug,
                    post.title,
                    post.excerpt,
                    post.content,
                    post.category,
                    post.author,
                    post.readTime,
                    post.tags,
                    post.featured,
                    post.publishedAt,
                ]
            );
        }
    }

    globalForBlog.__coneticaBlogSeeded = true;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    if (getDatabaseMode() !== 'postgres') {
        return BLOG_POSTS;
    }

    try {
        await ensurePostgresSchema();
        await seedInitialBlogPostsIfEmpty();
        const pool = getPgPool();
        if (!pool) return BLOG_POSTS;

        const res = await pool.query<{
            id: string;
            slug: string;
            title: string;
            excerpt: string;
            content: string;
            category: string;
            author: string;
            read_time: string;
            tags: string[];
            featured: boolean;
            published_at: Date | string;
        }>(
            `SELECT id, slug, title, excerpt, content, category, author, read_time, tags, featured, published_at
             FROM blog_posts
             ORDER BY published_at DESC, created_at DESC`
        );

        return res.rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            excerpt: row.excerpt,
            content: row.content,
            category: row.category as BlogPost['category'],
            author: row.author,
            publishedAt: new Date(row.published_at).toISOString().split('T')[0],
            readTime: row.read_time,
            tags: Array.isArray(row.tags) ? row.tags : [],
            featured: Boolean(row.featured),
        }));
    } catch {
        return BLOG_POSTS;
    }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    if (getDatabaseMode() !== 'postgres') {
        return BLOG_POSTS.find((p) => p.slug === slug);
    }

    try {
        await ensurePostgresSchema();
        await seedInitialBlogPostsIfEmpty();
        const pool = getPgPool();
        if (!pool) return BLOG_POSTS.find((p) => p.slug === slug);

        const res = await pool.query<{
            id: string;
            slug: string;
            title: string;
            excerpt: string;
            content: string;
            category: string;
            author: string;
            read_time: string;
            tags: string[];
            featured: boolean;
            published_at: Date | string;
        }>(
            `SELECT id, slug, title, excerpt, content, category, author, read_time, tags, featured, published_at
             FROM blog_posts
             WHERE slug = $1
             LIMIT 1`,
            [slug]
        );

        const row = res.rows[0];
        if (!row) return undefined;

        return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            excerpt: row.excerpt,
            content: row.content,
            category: row.category as BlogPost['category'],
            author: row.author,
            publishedAt: new Date(row.published_at).toISOString().split('T')[0],
            readTime: row.read_time,
            tags: Array.isArray(row.tags) ? row.tags : [],
            featured: Boolean(row.featured),
        };
    } catch {
        return BLOG_POSTS.find((p) => p.slug === slug);
    }
}
