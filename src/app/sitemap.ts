import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-data";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://conetica-educativa.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        "",
        "/services",
        "/pricing",
        "/schools",
        "/blog",
        "/legal/ethics",
        "/legal/privacy",
        "/legal/terms",
    ];

    const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" || route === "/blog" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.8,
    }));

    const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    return [...staticEntries, ...blogEntries];
}
