import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/src/firebase/blog";
import { getServices } from "@/src/firebase/getServices";
import { getBlogSlug } from "@/src/utilities/blogSlug";
import { getSiteUrl, siteUrl, timestampIso } from "@/src/utilities/blogSeo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    if (!getSiteUrl()) return [];
    const [posts, services] = await Promise.all([getPublishedBlogPosts(), getServices()]);
    return [
        { url: siteUrl("/") },
        { url: siteUrl("/blog") },
        ...posts.map(post => ({
            url: siteUrl(`/blog/${getBlogSlug(post)}`),
            ...(timestampIso(post.updatedAt) ? { lastModified: timestampIso(post.updatedAt) } : {}),
        })),
        ...services.filter(service => service.active && service.slug).map(service => ({
            url: siteUrl(`/${service.slug}`),
            ...(timestampIso(service.updatedAt) ? { lastModified: timestampIso(service.updatedAt) } : {}),
        })),
    ];
}
