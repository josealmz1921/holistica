import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { getPublishedBlogPostBySlug } from "@/src/firebase/blog";
import { getBlogSlug } from "@/src/utilities/blogSlug";
import BlogContent from "@/src/components/Blog/blogContent";
import BlogGallery from "@/src/components/Blog/blogGallery";
import styles from "@/src/components/Blog/blog.module.css";
import { blogMetadata, blogJsonLd, serializeJsonLd } from "@/src/utilities/blogSeo";

export const dynamic = "force-dynamic";
const getPost = cache(getPublishedBlogPostBySlug);
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "Entrada no encontrada | Flor de luna", robots: { index: false } };
    return blogMetadata(post);
}
export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) notFound();
    const canonicalSlug = getBlogSlug(post);
    if (slug !== canonicalSlug) permanentRedirect(`/blog/${canonicalSlug}`);
    return <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd(post)) }} />
        <article className={styles.article}>
            <Link href="/blog" className={styles.back}>← Volver al blog</Link>
            <header className={styles.heading}><p className={styles.eyebrow}>El diario de Flor de luna</p><h1>{post.title}</h1>{post.excerpt && <p className={styles.intro}>{post.excerpt}</p>}</header>
            <BlogContent content={post.content} />
            <BlogGallery media={post.media || []} title={post.title} />
            <footer className={styles.articleFooter}><p>Haz espacio para ti.</p><Link href="/#servicios" className={styles.all}>Descubre nuestros masajes ↗</Link></footer>
        </article>
    </main>;
}
