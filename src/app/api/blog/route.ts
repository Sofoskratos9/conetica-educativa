import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { ensurePostgresSchema, getDatabaseMode, getPgPool, logActivityEvent } from '@/lib/db';
import { getAllBlogPosts } from '@/lib/blog-server';
import { sanitizeInput } from '@/lib/security/sanitization';

const CreateBlogPostSchema = z.object({
    title: z.string().trim().min(3).max(180),
    category: z.enum(['Artículos', 'Guías', 'Padres', 'Estrategias']),
    excerpt: z.string().trim().min(5).max(500),
    content: z.string().trim().min(5).max(20000).optional(),
    readTime: z.string().trim().max(30).optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string().trim().max(40)).max(8).optional(),
});

const UpdateBlogPostSchema = z.object({
    id: z.string().min(1),
    title: z.string().trim().min(3).max(180).optional(),
    category: z.enum(['Artículos', 'Guías', 'Padres', 'Estrategias']).optional(),
    excerpt: z.string().trim().min(5).max(500).optional(),
    content: z.string().trim().min(5).max(20000).optional(),
    readTime: z.string().trim().max(30).optional(),
    featured: z.boolean().optional(),
});

function buildSlug(title: string): string {
    const base = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 70);
    return base || `articulo-${Date.now()}`;
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const posts = await getAllBlogPosts();
        return NextResponse.json({ posts });
    } catch (error) {
        console.error('[Blog GET]', error);
        return NextResponse.json({ error: 'No se pudieron cargar los artículos.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo administradores pueden publicar artículos.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = CreateBlogPostSchema.parse(body);

        if (getDatabaseMode() !== 'postgres') {
            return NextResponse.json(
                { error: 'Base de datos Postgres no disponible.' },
                { status: 503 }
            );
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
        }

        const cleanTitle = sanitizeInput(parsed.title).slice(0, 180);
        const cleanExcerpt = sanitizeInput(parsed.excerpt).slice(0, 500);
        const cleanContent = (parsed.content || `# ${cleanTitle}\n\n${cleanExcerpt}`).trim();
        const cleanReadTime = sanitizeInput(parsed.readTime || '5 min').slice(0, 30);
        const cleanTags = (parsed.tags && parsed.tags.length > 0 ? parsed.tags : [parsed.category]).map((t) =>
            sanitizeInput(t).slice(0, 40)
        );
        const slug = `${buildSlug(cleanTitle)}-${Date.now().toString(36).slice(-4)}`;

        const inserted = await pool.query<{
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
            `INSERT INTO blog_posts (slug, title, excerpt, content, category, author, read_time, tags, featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, slug, title, excerpt, content, category, author, read_time, tags, featured, published_at`,
            [
                slug,
                cleanTitle,
                cleanExcerpt,
                cleanContent,
                parsed.category,
                session.user.name || 'Equipo Conética',
                cleanReadTime,
                cleanTags,
                Boolean(parsed.featured),
            ]
        );

        const row = inserted.rows[0];
        await logActivityEvent({
            userId: session.user.id,
            userName: session.user.name,
            eventType: 'blog_post_created',
            action: `Publicó artículo "${cleanTitle}"`,
        });

        return NextResponse.json(
            {
                post: {
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    excerpt: row.excerpt,
                    content: row.content,
                    category: row.category,
                    author: row.author,
                    publishedAt: new Date(row.published_at).toISOString().split('T')[0],
                    readTime: row.read_time,
                    tags: row.tags || [],
                    featured: Boolean(row.featured),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Verifica título, categoría y resumen.' }, { status: 400 });
        }
        console.error('[Blog POST]', error);
        return NextResponse.json({ error: 'No se pudo publicar el artículo.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo administradores pueden editar artículos.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = UpdateBlogPostSchema.parse(body);

        if (getDatabaseMode() !== 'postgres') {
            return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
        }

        const existingRes = await pool.query<{
            id: string;
            title: string;
            category: string;
            excerpt: string;
            content: string;
            read_time: string;
            featured: boolean;
        }>(`SELECT id, title, category, excerpt, content, read_time, featured FROM blog_posts WHERE id = $1 LIMIT 1`, [
            parsed.id,
        ]);

        const current = existingRes.rows[0];
        if (!current) {
            return NextResponse.json({ error: 'Artículo no encontrado.' }, { status: 404 });
        }

        const nextTitle = parsed.title ? sanitizeInput(parsed.title).slice(0, 180) : current.title;
        const nextCategory = parsed.category || current.category;
        const nextExcerpt = parsed.excerpt ? sanitizeInput(parsed.excerpt).slice(0, 500) : current.excerpt;
        const nextContent = parsed.content !== undefined ? parsed.content : current.content;
        const nextReadTime = parsed.readTime ? sanitizeInput(parsed.readTime).slice(0, 30) : current.read_time;
        const nextFeatured = parsed.featured !== undefined ? parsed.featured : current.featured;

        const updated = await pool.query<{
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
            `UPDATE blog_posts
             SET title = $1, category = $2, excerpt = $3, content = $4, read_time = $5, featured = $6, updated_at = NOW()
             WHERE id = $7
             RETURNING id, slug, title, excerpt, content, category, author, read_time, tags, featured, published_at`,
            [nextTitle, nextCategory, nextExcerpt, nextContent, nextReadTime, nextFeatured, parsed.id]
        );

        const row = updated.rows[0];
        await logActivityEvent({
            userId: session.user.id,
            userName: session.user.name,
            eventType: 'blog_post_updated',
            action: `Actualizó artículo "${row.title}"`,
        });

        return NextResponse.json({
            post: {
                id: row.id,
                slug: row.slug,
                title: row.title,
                excerpt: row.excerpt,
                content: row.content,
                category: row.category,
                author: row.author,
                publishedAt: new Date(row.published_at).toISOString().split('T')[0],
                readTime: row.read_time,
                tags: row.tags || [],
                featured: Boolean(row.featured),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos de edición inválidos.' }, { status: 400 });
        }
        console.error('[Blog PATCH]', error);
        return NextResponse.json({ error: 'No se pudo actualizar el artículo.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo administradores pueden eliminar artículos.' }, { status: 403 });
    }

    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
        }

        if (getDatabaseMode() === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            await pool?.query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
            await logActivityEvent({
                userId: session.user.id,
                userName: session.user.name,
                eventType: 'blog_post_deleted',
                action: `Eliminó artículo (${id})`,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Blog DELETE]', error);
        return NextResponse.json({ error: 'No se pudo eliminar el artículo.' }, { status: 500 });
    }
}
