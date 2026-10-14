import { getBlogSlug } from "@/src/utilities/blogSlug";
import Image from "next/image";
import Link from "next/link";
import type { BlogEntry } from "@/src/firebase/blog";
import styles from "./blog.module.css";

export default function BlogCards({ posts }: { posts: BlogEntry[] }) {
    return <div className={styles.grid}>{posts.map(post => {
        const cover = post.media?.find(media => media.resourceType === "image");
        return <article key={post.id} className={styles.card}>
            <Link href={`/blog/${getBlogSlug(post)}`} className={styles.cardLink}>
                {cover && <div className={styles.cover}>
                    <Image fill src={cover.url} alt={cover.alt?.trim() || post.title} sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />
                </div>}
                <div className={styles.cardBody}><p className={styles.eyebrow}>Bienestar y conexión</p><h3>{post.title}</h3><p className={styles.excerpt}>{post.excerpt}</p><span className={styles.read}>Leer entrada <span aria-hidden="true">↗</span></span></div>
            </Link>
        </article>;
    })}</div>;
}
