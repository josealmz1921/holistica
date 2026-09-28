import Link from "next/link";
import { getPublishedBlogPosts } from "@/src/firebase/blog";
import BlogCards from "./blogCards";
import styles from "./blog.module.css";

export default async function Blog() {
    let posts;
    try { posts = await getPublishedBlogPosts(); }
    catch (error) { console.error("No se pudo cargar el blog", error); return null; }
    if (!posts.length) return null;
    return <section id="blog" className={styles.section} aria-labelledby="blog-title">
        <div className={styles.container}>
            <header className={styles.sectionHeader}><div><p className={styles.eyebrow}>El diario de Flor de luna</p><h2 id="blog-title">Un momento para tu bienestar</h2><p className={styles.intro}>Ideas e historias para reconectar contigo, dentro y fuera de cada sesión.</p></div><Link className={styles.all} href="/blog">Explorar el blog ↗</Link></header>
            <BlogCards posts={posts.slice(0, 3)} />
        </div>
    </section>;
}
