import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedBlogPostBySlug } from "@/src/firebase/blog";
import { getBlogSlug } from "@/src/utilities/blogSlug";
import BlogContent from "@/src/components/Blog/blogContent";
import styles from "@/src/components/Blog/blog.module.css";

export const dynamic = "force-dynamic";
const getPost = cache(getPublishedBlogPostBySlug);
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "Entrada no encontrada | Flor de luna", robots: { index: false } };
    const image = post.media?.find(media => media.resourceType === "image");
    const path = `/blog/${getBlogSlug(post)}`;
    const canonical = process.env.NEXT_PUBLIC_SITE_URL ? new URL(path, process.env.NEXT_PUBLIC_SITE_URL).toString() : path;
    return { title: `${post.title} | Flor de luna`, description: post.excerpt, alternates: { canonical }, openGraph: { type: "article", url: canonical, title: post.title, description: post.excerpt, ...(image ? { images: [image.url] } : {}) } };
}
export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) notFound();
    const canonicalSlug = getBlogSlug(post);
    if (slug !== canonicalSlug) permanentRedirect(`/blog/${canonicalSlug}`);
    return <main className={styles.page}>
        <article className={styles.article}>
            <Link href="/blog" className={styles.back}>← Volver al blog</Link>
            <header className={styles.heading}><p className={styles.eyebrow}>El diario de Flor de luna</p><h1>{post.title}</h1>{post.excerpt && <p className={styles.intro}>{post.excerpt}</p>}</header>
            <BlogContent content={post.content} />
            {!!post.media?.length && <section className={styles.gallery} aria-label="Imágenes y videos de la entrada">
                {post.media.map((media, index) => <figure key={`${media.publicId}-${index}`}>
                    {media.resourceType === "video" ? <video controls preload="metadata" playsInline aria-label={media.name || `Video ${index + 1}`} src={media.url}>Tu navegador no admite este video.</video> : <div className={styles.articleImage}><Image fill src={media.url} alt={`${post.title} — imagen ${index + 1}`} sizes="(max-width: 850px) 100vw, 800px" /></div>}
                </figure>)}
            </section>}
            <footer className={styles.articleFooter}><p>Haz espacio para ti.</p><Link href="/#servicios" className={styles.all}>Descubre nuestros masajes ↗</Link></footer>
        </article>
    </main>;
}
