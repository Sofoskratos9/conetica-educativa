import { getAllBlogPosts } from "@/lib/blog-server";
import { BlogExplorer } from "@/components/blog/BlogExplorer";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
    const posts = await getAllBlogPosts();
    return <BlogExplorer initialPosts={posts} />;
}
