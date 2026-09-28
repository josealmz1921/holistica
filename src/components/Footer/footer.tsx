import Link from "next/link";
import styles from "./footer.module.css";
export default function Footer() {
    return <footer className={styles.root}><div className={styles.inner}>
        <div><Link href="/" className={styles.brand}>Flor de luna</Link><p className={styles.tagline}>Un espacio para volver a ti.</p></div>
        <nav className={styles.links} aria-label="Enlaces del pie de página"><Link href="/#servicios">Masajes</Link><Link href="/#nosotros">Nosotros</Link><Link href="/blog">Blog</Link></nav>
        <p className={styles.copyright}>© {new Date().getFullYear()} Flor de luna.</p>
    </div></footer>;
}
