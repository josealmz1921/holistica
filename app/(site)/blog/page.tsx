import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "@/src/firebase/blog";
import BlogCards from "@/src/components/Blog/blogCards";
import styles from "@/src/components/Blog/blog.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog | Flor de luna", description: "Ideas e historias para cuidar tu bienestar y reconectar contigo." };
export default async function BlogPage() {
    const posts = await getPublishedBlogPosts();
    return <main className={styles.page}>
        <div className={styles.container}>
            <Link href="/" className={styles.back}>← Volver al inicio</Link>
            <header className={styles.heading}><p className={styles.eyebrow}>El diario de Flor de luna</p><h1>Un momento para tu bienestar</h1><p className={styles.intro}>Descubre ideas, historias y pequeños rituales para reconectar contigo.</p></header>
            {posts.length ? <BlogCards posts={posts} /> : <div className={styles.empty}><h2>Pronto compartiremos nuevas historias</h2><p>Mientras tanto, descubre nuestras experiencias de bienestar.</p><Link href="/#servicios" className={styles.all}>Explorar masajes ↗</Link></div>}
        </div>
    </main>;
}
