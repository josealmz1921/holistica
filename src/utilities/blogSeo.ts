import type { Metadata } from "next";
import type { BlogEntry, BlogPost } from "../firebase/blog";
import { getBlogSlug } from "./blogSlug";

export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 160;
export const validateSeoTitle = (value: unknown) => String(value || "").trim().length > SEO_TITLE_MAX ? `Usa hasta ${SEO_TITLE_MAX} caracteres.` : undefined;
export const validateSeoDescription = (value: unknown) => String(value || "").trim().length > SEO_DESCRIPTION_MAX ? `Usa hasta ${SEO_DESCRIPTION_MAX} caracteres.` : undefined;

export function getSiteUrl(): string | undefined {
    try {
        const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
        return ["http:", "https:"].includes(url.protocol) ? url.origin : undefined;
    } catch { return undefined; }
}

export function siteUrl(path: string): string {
    const base = getSiteUrl();
    return base ? new URL(path, `${base}/`).toString() : path;
}

export function blogSeoText(post: Pick<BlogPost, "title" | "excerpt" | "seoTitle" | "seoDescription">) {
    return {
        title: post.seoTitle?.trim() || `${post.title} | Flor de luna`,
        description: post.seoDescription?.trim() || post.excerpt?.trim() || `Lee «${post.title}» en el blog de Flor de luna.`,
    };
}

export function blogSeoImage(post: Pick<BlogPost, "media" | "seoImagePublicId">) {
    const images = post.media?.filter(media => media.resourceType === "image") || [];
    return images.find(image => image.publicId === post.seoImagePublicId) || images[0];
}

export function timestampIso(value: unknown): string | undefined {
    if (!value || typeof value !== "object" || !("toDate" in value) || typeof value.toDate !== "function") return undefined;
    const date = value.toDate();
    return date instanceof Date && Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

export function blogMetadata(post: BlogEntry): Metadata {
    const { title, description } = blogSeoText(post);
    const canonical = siteUrl(`/blog/${getBlogSlug(post)}`);
    const image = blogSeoImage(post);
    const publishedTime = timestampIso(post.publishedAt);
    const modifiedTime = timestampIso(post.updatedAt);
    const images = image ? [{ url: image.url, alt: image.alt?.trim() || post.title }] : [];
    return {
        title, description,
        alternates: { canonical },
        robots: { index: true, follow: true },
        openGraph: {
            type: "article", locale: "es_MX", siteName: "Flor de luna", url: canonical,
            title, description, images,
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
        },
        twitter: { card: image ? "summary_large_image" : "summary", title, description, images },
    };
}

export function blogJsonLd(post: BlogEntry) {
    const { description } = blogSeoText(post);
    const image = blogSeoImage(post);
    const datePublished = timestampIso(post.publishedAt);
    const dateModified = timestampIso(post.updatedAt);
    const url = siteUrl(`/blog/${getBlogSlug(post)}`);
    return {
        "@context": "https://schema.org", "@type": "BlogPosting",
        headline: post.title, description, inLanguage: "es-MX",
        ...(getSiteUrl() ? { url, mainEntityOfPage: { "@type": "WebPage", "@id": url } } : {}),
        publisher: { "@type": "Organization", name: "Flor de luna", ...(getSiteUrl() ? { url: getSiteUrl() } : {}) },
        ...(image ? { image: [image.url] } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
    };
}

export function serializeJsonLd(value: unknown): string {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}
