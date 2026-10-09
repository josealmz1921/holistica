"use client";

import { useRef, useState } from "react";
import { Form } from "informed";
import Link from "next/link";
import Input from "@/src/components/Input";
import Select from "@/src/components/Select";
import Textarea from "@/src/components/Textarea";
import ServiceDescriptionEditor, { type ServiceDescriptionApi } from "@/src/components/ServiceDescriptionEditor/serviceDescriptionEditor";
import { Toggle } from "@/src/components/Toggle/Toggle";
import Dropzone from "@/src/components/Dropzone";
import BenefitsField from "@/src/components/BenefitsField";
import { useServicePage } from "./hooks/useServicePage";
import { ArrowLeft } from "@/src/components/Icons/icons";
import LoaderPage from "@/src/components/LoaderPage";
import { isRequired } from "@/src/utilities/formValidations";
import classes from "./service.module.css";

export default function ServicesPage() {
    const [saving, setSaving] = useState(false);
    const [processingImages, setProcessingImages] = useState(false);
    const descriptionEditor = useRef<ServiceDescriptionApi | null>(null);
    const [descriptionError, setDescriptionError] = useState("");
    const {
        loading,
        categories,
        initialValues,
        handleSubmit,
        setDropzoneFiles,
        handleDeleteImage,
    } = useServicePage();

    if (loading) return <LoaderPage />;
    const editing = Boolean(initialValues.id);

    return (
        <div className={classes.root}>
            <Link href="/dashboard/services" className={classes.back}>
                <ArrowLeft className="size-4" /> Volver a servicios
            </Link>
            <header className={classes.header}>
                <p className={classes.eyebrow}>Tu espacio de bienestar</p>
                <h1>{editing ? "Editar servicio" : "Nuevo servicio"}</h1>
                <p className={classes.help}>Dale forma a la experiencia: comparte sus detalles, imágenes y beneficios.</p>
            </header>
            <Form initialValues={initialValues} onSubmit={async (data) => {
                if (saving || processingImages) return;
                setSaving(true);
                setDescriptionError("");
                try {
                    if (!descriptionEditor.current) throw new Error("Espera a que el editor de descripción termine de cargar.");
                    const { content, text } = await descriptionEditor.current.save();
                    if (!text) throw new Error("Escribe la descripción del servicio.");
                    await handleSubmit({ ...data, values: { ...data.values, desc: text, descriptionContent: content } });
                } catch (error) {
                    setDescriptionError(error instanceof Error ? error.message : "No se pudo guardar la descripción.");
                } finally {
                    setSaving(false);
                }
            }}>
                <fieldset className={classes.form} disabled={saving} aria-busy={saving}>
                    <section className={`${classes.card} ${classes.information}`} aria-labelledby="service-info-title">
                        <h2 id="service-info-title">Información general</h2>
                        <p className={classes.help}>Los detalles que ayudarán a elegir esta sesión.</p>
                        <div className={classes.fields}>
                            <div className={classes.fullWidth}>
                                <Input identifier="name" label="Nombre del servicio" placeholder="Ej. Masaje relajante" validate={isRequired} />
                            </div>
                            <Select name="category" label="Categoría" placeholder="Selecciona una categoría" options={categories} validate={isRequired} disabled={saving} classes={{ input: classes.selectInput, standard: classes.fieldLabel, optionSelected: classes.selectedOption }} />
                            <Input identifier="duration" label="Duración" after="min" type="number" placeholder="60" validate={isRequired} />
                            <div className={classes.fullWidth}>
                                <ServiceDescriptionEditor initialText={initialValues.desc || ""} initialContent={initialValues.descriptionContent} apiRef={descriptionEditor} disabled={saving} />
                                {descriptionError && <p role="alert">{descriptionError}</p>}
                            </div>
                        </div>
                        <div className={classes.status}>
                            <div><h3>Visible en el catálogo</h3><p className={classes.help}>Activa el servicio para mostrarlo en la página de inicio.</p></div>
                            <Toggle name="active" ariaLabel="Mostrar servicio en el catálogo" initialValue={initialValues.active} disabled={saving} />
                        </div>
                    </section>

                    <section className={`${classes.card} ${classes.gallery}`} aria-labelledby="service-gallery-title">
                        <h2 id="service-gallery-title">Galería de imágenes</h2>
                        <p className={classes.help}>Muestra el ambiente y la experiencia de esta sesión.</p>
                        <Dropzone getValues={setDropzoneFiles} initialValues={initialValues.gallery} onDelete={handleDeleteImage} disabled={saving} onProcessingChange={setProcessingImages} />
                        <p className={classes.note}>JPG o PNG, hasta 250 KB y 1200 × 1200 px por imagen.</p>
                        <p className={classes.note}>La primera imagen será la portada. Arrastra las imágenes para ordenarlas.</p>
                    </section>

                    <section className={`${classes.card} ${classes.fullWidth}`} aria-labelledby="service-message-title">
                        <h2 id="service-message-title">Reservas por WhatsApp</h2>
                        <p className={classes.help}>Escribe el mensaje que aparecerá al solicitar una reserva de este servicio.</p>
                        <div className={classes.messageField}>
                            <Textarea label="Mensaje de reserva" identifier="message" type="text" validate={isRequired} />
                        </div>
                    </section>

                    <section className={`${classes.card} ${classes.fullWidth}`} aria-label="Beneficios del servicio">
                        <BenefitsField name="benefits" title="Beneficios" validate={isRequired} />
                    </section>

                    <section className={`${classes.card} ${classes.fullWidth}`} aria-label="Recorrido de la sesión">
                        <BenefitsField name="route" title="Recorrido de la sesión" validate={isRequired} />
                        <p className={classes.note}>Describe los momentos de la sesión en el orden en que ocurren.</p>
                    </section>

                    <details className={`${classes.card} ${classes.seo}`}>
                        <summary>SEO y redes sociales <span className={classes.optional}>Opcional</span></summary>
                        <p className={classes.help}>Personaliza cómo se presenta el servicio al buscarlo o compartirlo.</p>
                        <div className={classes.seoForm}>
                            <div className={classes.seoGroup}>
                                <h3>Buscadores</h3>
                                <Input identifier="seoTitle" label="Título SEO" />
                                <Textarea identifier="seoDescription" label="Descripción SEO" type="text" />
                            </div>
                            <div className={classes.seoGroup}>
                                <h3>Facebook y WhatsApp</h3>
                                <Input identifier="ogTitle" label="Título para compartir" />
                                <Textarea identifier="ogDescription" label="Descripción para compartir" type="text" />
                            </div>
                            <div className={classes.seoGroup}>
                                <h3>X</h3>
                                <Input identifier="twitterTitle" label="Título para X" />
                                <Textarea identifier="twitterDescription" label="Descripción para X" type="text" />
                            </div>
                        </div>
                    </details>

                    <div className={classes.actions}>
                        <p className={classes.help}>Guarda los cambios para actualizar la información del servicio.</p>
                        <button type="submit" className={classes.saveButton} disabled={saving || processingImages}>
                            {saving ? "Guardando…" : processingImages ? "Procesando imágenes…" : editing ? "Guardar cambios" : "Crear servicio"}
                        </button>
                    </div>
                </fieldset>
            </Form>
        </div>
    );
}
