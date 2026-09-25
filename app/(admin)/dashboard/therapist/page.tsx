"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Dropzone from "@/src/components/Dropzone";
import type { PreviewFile } from "@/src/components/Dropzone/types";
import { getTherapist, saveTherapist, type TherapistProfile } from "@/src/firebase/therapist";
import { uploadImage } from "@/src/utilities/cloudinary";
import styles from "./therapist.module.css";

const emptyProfile: TherapistProfile = { name: "", specialty: "", description: "", photo: null };

export default function TherapistPage() {
    const [profile, setProfile] = useState<TherapistProfile>(emptyProfile);
    const [files, setFiles] = useState<PreviewFile[]>([]);
    const [initialFiles, setInitialFiles] = useState<PreviewFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processingImage, setProcessingImage] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const pending = useRef(false);
    const uploaded = useRef<{ file: File; photo: NonNullable<TherapistProfile["photo"]> } | null>(null);

    useEffect(() => {
        let cancelled = false;
        getTherapist().then((data) => {
            if (cancelled) return;
            const current = data || emptyProfile;
            setProfile(current);
            const images = current.photo ? [{
                preview: current.photo.url,
                id: current.photo.publicId,
                width: current.photo.width,
                height: current.photo.height,
            }] : [];
            setInitialFiles(images);
            setFiles(images);
        }).catch(() => {
            if (!cancelled) setLoadError(true);
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending.current || processingImage) return;
        setError("");
        setMessage("");
        const values = {
            name: profile.name.trim(),
            specialty: profile.specialty.trim(),
            description: profile.description.trim(),
        };
        if (!values.name || !values.specialty || !values.description) {
            setError("Completa el nombre, la especialidad y la presentación.");
            return;
        }
        pending.current = true;
        setSaving(true);
        try {
            let photo = files.length ? profile.photo : null;
            const file = files[0]?.file;
            if (file) {
                if (uploaded.current?.file !== file) {
                    const result = await uploadImage(file);
                    if (!result.secure_url || !result.public_id) throw new Error("Imagen no válida");
                    uploaded.current = { file, photo: {
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height,
                    } };
                }
                photo = uploaded.current.photo;
            }
            const nextProfile = { ...values, photo };
            await saveTherapist(nextProfile);
            setProfile(nextProfile);
            setMessage("Perfil guardado. Los cambios ya están disponibles en la página de inicio.");
        } catch {
            setError("No se pudo guardar el perfil. Tus cambios siguen aquí; vuelve a intentarlo.");
        } finally {
            pending.current = false;
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.root} role="status">Cargando perfil…</div>;
    if (loadError) return <div className={styles.root}><p role="alert">No se pudo cargar el perfil.</p><button className={styles.save} onClick={() => window.location.reload()}>Reintentar</button></div>;

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <div><p className={styles.eyebrow}>Tu espacio de bienestar</p><h1>Perfil del terapeuta</h1><p>Presenta a la persona detrás de cada sesión.</p></div>
                <a href="/" target="_blank" rel="noopener noreferrer" className={styles.preview}>Ver sitio ↗</a>
            </header>
            <form onSubmit={handleSubmit}>
                <fieldset disabled={saving} className={styles.form}>
                    <section className={styles.card} aria-labelledby="photo-title">
                        <h2 id="photo-title">Fotografía</h2>
                        <p className={styles.help}>Una imagen cercana y natural para dar la bienvenida.</p>
                        <Dropzone initialValues={initialFiles} getValues={setFiles} maxFiles={1} disabled={saving} onProcessingChange={setProcessingImage} />
                        <p className={styles.help}>Una sola foto, JPG o PNG. Máximo 250 KB y 1200 × 1200 px. Para cambiarla, elimina la actual y selecciona otra.</p>
                        <p className={styles.note}>La foto se actualiza al guardar los cambios.</p>
                    </section>
                    <section className={styles.card} aria-labelledby="info-title">
                        <h2 id="info-title">Información personal</h2>
                        <label className={styles.field}>Nombre<input required maxLength={100} autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Nombre del terapeuta" /></label>
                        <label className={styles.field}>Especialidad<input required maxLength={150} value={profile.specialty} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} placeholder="Ej. Masaje holístico y relajación" /></label>
                        <label className={styles.field}>Presentación<textarea required maxLength={3000} rows={8} value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} placeholder="Comparte tu experiencia, tu enfoque y cómo acompañas a cada persona." /></label>
                        <p className={styles.help}>Este texto aparecerá en “Conoce a tu terapeuta”.</p>
                    </section>
                    <div className={styles.actions}>
                        <p className={styles.help}>Los cambios se publican al guardar.</p>
                        <button className={styles.save} type="submit" disabled={saving || processingImage}>{saving ? "Guardando…" : processingImage ? "Procesando foto…" : "Guardar cambios"}</button>
                    </div>
                </fieldset>
                {error && <p className={styles.error} role="alert">{error}</p>}
                {message && <p className={styles.success} role="status">{message}</p>}
            </form>
        </div>
    );
}
