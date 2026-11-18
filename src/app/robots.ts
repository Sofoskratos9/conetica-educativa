import type { MetadataRoute } from "next";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://conetica-educativa.vercel.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/services", "/pricing", "/schools", "/blog", "/legal"],
                disallow: ["/admin", "/dashboard", "/parent", "/api", "/auth", "/checkout"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
