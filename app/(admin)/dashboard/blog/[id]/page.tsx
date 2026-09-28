"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Form, type FormState, type FormApi, useFormState } from "informed";
import Input from "@/src/components/Input";
import Textarea from "@/src/components/Textarea";
import { Toggle } from "@/src/components/Toggle/Toggle";
import { createBlogSlug, getBlogSlug, validateBlogTitle, validateBlogExcerpt, validateBlogSlug } from "@/src/utilities/blogSlug";
import BlogEditor, { type TextEditorApi } from "@/src/components/BlogEditor/blogEditor";
import Dropzone from "@/src/components/Dropzone";
import type { PreviewFile } from "@/src/components/Dropzone/types";
import { getBlogPost, newBlogId, saveBlogPost, type BlogPost, type BlogMedia } from "@/src/firebase/blog";
import { uploadBlogMedia } from "@/src/utilities/cloudinary";
import ui from "@/src/components/AdminLayout/admin.module.css";
import styles from "../blog.module.css";

const emptyPost: BlogPost = { slug: "", title: "", excerpt: "", content: { blocks: [] }, media: [], published: false };
export default function BlogPostPage() {
    const { id } = useParams<{ id: string }>();
    return <PostForm key={id} id={id} />;
}
function PostForm({ id }: { id: string }) {
    const [initialPost, setInitialPost] = useState<BlogPost>(emptyPost);
    const [initialFiles, setInitialFiles] = useState<PreviewFile[]>([]);
    const [files, setFiles] = useState<PreviewFile[]>([]);
    const [loading, setLoading] = useState(id !== "new");
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [savedId, setSavedId] = useState("");
    const [savedSlug, setSavedSlug] = useState("");
    const formApi = useRef<FormApi | null>(null);
    const editor = useRef<TextEditorApi | null>(null);
    const targetId = useRef(id === "new" ? "" : id);
    const pending = useRef(false);
    const uploads = useRef(new Map<File, BlogMedia>());
    useEffect(() => {
        if (id === "new") return;
        let cancelled = false;
        getBlogPost(id).then(data => {
            if (cancelled) return;
            if (!data) { setLoadError("Esta entrada no existe."); return; }
            setInitialPost({ ...data, slug: getBlogSlug({ ...data, id }) });
            const media = data.media.map(item => ({ preview: item.url, id: item.publicId, resourceType: item.resourceType, name: item.name }));
            setFiles(media);
            setInitialFiles(media);
        }).catch(() => { if (!cancelled) setLoadError("No se pudo cargar la entrada. Recarga la página para reintentar."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    async function submit({ values }: FormState) {
        if (pending.current || processing) return;
        setError(""); setMessage("");
        const title = String(values.title || "").trim();
        const slug = String(values.slug || "") || createBlogSlug(title);
        const validation = validateBlogTitle(title) || validateBlogSlug(slug) || validateBlogExcerpt(values.excerpt);
        if (validation || !slug) { setError(validation || "Escribe un slug válido para la entrada."); return; }
        if (!editor.current) { setError("Espera a que el editor termine de cargar."); return; }
        pending.current = true; setSaving(true);
        try {
            const content = await editor.current.save();
            if (!content.blocks.length) throw new Error("Escribe el contenido de la entrada.");
            const media: BlogMedia[] = [];
            for (const item of files) {
                if (item.file) {
                    let uploaded = uploads.current.get(item.file);
                    if (!uploaded) {
                        uploaded = await uploadBlogMedia(item.file);
                        uploads.current.set(item.file, uploaded);
                    }
                    media.push(uploaded);
                } else {
                    const existing = initialPost.media.find(asset => asset.publicId === item.id);
                    if (existing) media.push(existing);
                }
            }
            if (!targetId.current) targetId.current = newBlogId();
            const next = { title, slug, excerpt: String(values.excerpt || "").trim(), published: Boolean(values.published), content, media };
            await saveBlogPost(targetId.current, next);
            formApi.current?.setValue("slug", slug);
            setSavedSlug(slug);
            setSavedId(targetId.current);
            setMessage("Entrada guardada correctamente.");
        } catch (reason) {
            setError(reason instanceof Error ? `No se guardó la entrada: ${reason.message}` : "No se pudo guardar. Inténtalo de nuevo.");
        } finally { pending.current = false; setSaving(false); }
    }
    if (loading) return <div className={ui.root} role="status">Cargando entrada…</div>;
    if (loadError) return <div className={ui.root}><p role="alert">{loadError}</p><Link href="/dashboard/blog">Volver al blog</Link></div>;
    return <div className={ui.root}>
        <Link href="/dashboard/blog" className={styles.back}>← Volver al blog</Link>
        <header className={ui.header}><div><p className={ui.eyebrow}>Tu espacio de bienestar</p><h1 className={ui.title}>{id === "new" ? "Nueva entrada" : "Editar entrada"}</h1><p className={ui.help}>Dale voz a tu experiencia y acompáñala con imágenes o videos.</p></div></header>
        <Form initialValues={{ ...initialPost }} formApiRef={formApi} onSubmit={submit}>
            <fieldset disabled={saving} className={styles.form}>
                <section className={styles.card} aria-labelledby="post-info"><h2 id="post-info">Información de la entrada</h2>
                    <Input identifier="title" label="Título" required validate={validateBlogTitle} classes={{ root: styles.field, input: styles.textInput, label: styles.fieldLabel }} />
                    <Input identifier="slug" label="Slug de la URL" placeholder="ejemplo-de-entrada" validate={validateBlogSlug} classes={{ root: styles.field, input: styles.textInput, label: styles.fieldLabel }} />
                    <SlugPreview />
                    <Textarea identifier="excerpt" type="text" label="Resumen" validate={validateBlogExcerpt} classes={{ root: styles.field, input: styles.textarea, label: styles.fieldLabel }} />
                    <div className={styles.visibility}><Toggle name="published" label="Marcar como publicada" initialValue={initialPost.published} disabled={saving} /></div><p className={ui.help}>Desactiva esta opción para guardar un borrador.</p>
                </section>
                <section className={styles.card} aria-labelledby="post-content"><h2 id="post-content">Contenido</h2><p className={styles.help}>Párrafos, encabezados y listas. Selecciona texto para aplicar negrita, cursiva o enlaces.</p>
                    <div inert={saving}><BlogEditor initialValue={initialPost.content} apiRef={editor} /></div>
                </section>
                <section className={styles.card} aria-labelledby="post-media"><h2 id="post-media">Imágenes y videos</h2><p className={styles.help}>Hasta 10 archivos. Imágenes JPG/PNG de hasta 5 MB y 1200 × 1200 px; videos MP4/WebM de hasta 50 MB. Arrastra para ordenar. Los cambios se aplican al guardar.</p>
                    <Dropzone allowVideo maxFiles={10} maxImageSize={5 * 1024 * 1024} initialValues={initialFiles} getValues={setFiles} onProcessingChange={setProcessing} disabled={saving} />
                </section>
                <div className={styles.actions}><p className={ui.help}>El texto y los archivos se guardan juntos en esta entrada.</p><button className={ui.primary} type="submit" disabled={saving || processing}>{saving ? "Guardando entrada y archivos…" : processing ? "Procesando archivos…" : "Guardar entrada"}</button></div>
            </fieldset>
            {error && <p className={styles.error} role="alert">{error}</p>}
            {message && <p className={styles.success} role="status">{message} <Link href={`/dashboard/blog/${savedId}`}>Seguir editando</Link> · <Link href={`/blog/${savedSlug}`} target="_blank" rel="noopener noreferrer">Ver página pública (solo publicada)</Link></p>}
        </Form>
    </div>;
}

function SlugPreview() {
    const { values } = useFormState();
    const slug = String(values.slug || "") || createBlogSlug(String(values.title || ""));
    return <p className={styles.help}>URL: /blog/{slug || "titulo-de-la-entrada"}. Si dejas el slug vacío, se genera desde el título.</p>;
}
