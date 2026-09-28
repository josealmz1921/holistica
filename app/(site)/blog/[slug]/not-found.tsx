import Link from "next/link";
import styles from "@/src/components/Blog/blog.module.css";
export default function NotFound() {
    return <main className={styles.page}><div className={styles.empty}><h1>Entrada no disponible</h1><p>Esta entrada no existe o todavía no está publicada.</p><Link href="/blog" className={styles.all}>Volver al blog</Link></div></main>;
}
