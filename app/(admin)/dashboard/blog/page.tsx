"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteBlogPost, getBlogPosts, type BlogEntry } from "@/src/firebase/blog";
import ui from "@/src/components/AdminLayout/admin.module.css";

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        getBlogPosts().then(data => { if (!cancelled) setPosts(data); })
            .catch(() => { if (!cancelled) setError("No se pudieron cargar las entradas. Recarga la página para reintentar."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);
    async function remove(post: BlogEntry) {
        if (deleting || !window.confirm(`¿Eliminar la entrada “${post.title}”?`)) return;
        setDeleting(post.id);
        setError("");
        try {
            await deleteBlogPost(post.id);
            setPosts(current => current.filter(item => item.id !== post.id));
        } catch { setError("No se pudo eliminar la entrada. Inténtalo de nuevo."); }
        finally { setDeleting(null); }
    }
    const filtered = posts.filter(post => post.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
    return <div className={ui.root}>
        <header className={ui.header}><div><p className={ui.eyebrow}>Tu espacio de bienestar</p><h1 className={ui.title}>Blog</h1><p className={ui.help}>Comparte historias, consejos y momentos de bienestar.</p></div><Link className={ui.primary} href="/dashboard/blog/new">+ Nueva entrada</Link></header>
        <div className={ui.toolbar}><input className={ui.search} type="search" aria-label="Buscar entradas" placeholder="Buscar por título…" value={search} onChange={e => setSearch(e.target.value)} /><p className={ui.help}>{filtered.length} entradas</p></div>
        {error && <p role="alert">{error}</p>}
        {loading ? <p role="status">Cargando entradas…</p> : <div className={ui.table}>
            <div className={ui.tableHeader}><p>Entrada</p><p>Estado</p><p>Acciones</p></div>
            {filtered.map(post => <div key={post.id} className={ui.tableRow}>
                <div><p className={ui.name}>{post.title}</p><p className={ui.secondary}>{post.excerpt}</p></div>
                <span className={post.published ? ui.badge : ui.inactive}>{post.published ? "Publicada" : "Borrador"}</span>
                <div className={ui.rowActions}><Link href={`/dashboard/blog/${post.id}`} aria-label={`Editar ${post.title}`}>Editar</Link><button type="button" disabled={Boolean(deleting)} onClick={() => remove(post)} aria-label={`Eliminar ${post.title}`}>{deleting === post.id ? "Eliminando…" : "Eliminar"}</button></div>
            </div>)}
            {!filtered.length && !error && <p className={ui.empty}>{search ? "No hay entradas con ese título." : "Crea tu primera entrada para comenzar."}</p>}
        </div>}
    </div>;
}
