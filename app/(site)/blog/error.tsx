"use client";
import styles from "@/src/components/Blog/blog.module.css";
export default function BlogError({ reset }: { reset: () => void }) {
    return <main className={styles.page}><div className={styles.empty}><h1>No pudimos cargar el blog</h1><p>Inténtalo de nuevo en un momento.</p><button onClick={reset} className={styles.all}>Reintentar</button></div></main>;
}
