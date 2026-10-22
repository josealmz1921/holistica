"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowsPointingOutIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { BlogMedia } from "@/src/firebase/blog";
import styles from "./blogGallery.module.css";

type Props = { media: BlogMedia[]; title: string };

export default function BlogGallery({ media, title }: Props) {
    const headingId = useId();
    const [selected, setSelected] = useState<{ asset: BlogMedia; index: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const items = media.map((asset, index) => ({ asset, index }));
    const images = items.filter(({ asset }) => asset.resourceType === "image");
    const videos = items.filter(({ asset }) => asset.resourceType === "video");
    const imageAlt = (asset: BlogMedia, index: number) => asset.alt?.trim() || `${title} — imagen ${index + 1}`;
    const close = () => { setSelected(null); setZoom(1); };

    if (!media.length) return null;

    return <section className={styles.gallery} aria-labelledby={headingId}>
        <header className={styles.heading}>
            <div><p className={styles.eyebrow}>Instantes que inspiran</p><h2 id={headingId}>Una mirada más cerca</h2></div>
            {!!images.length && <p className={styles.hint}><ArrowsPointingOutIcon aria-hidden="true" /> Toca una imagen para ampliarla</p>}
        </header>
        {!!images.length && <div className={`${styles.collage} ${images.length === 1 ? styles.single : ""} ${images.length >= 5 ? styles.many : ""}`}>
            {images.map(({ asset, index }) => <button
                key={`${asset.publicId}-${index}`}
                type="button"
                className={styles.tile}
                aria-label={`Ampliar: ${imageAlt(asset, index)}`}
                aria-haspopup="dialog"
                onClick={() => { setZoom(1); setSelected({ asset, index }); }}
            >
                <Image fill src={asset.url} alt={imageAlt(asset, index)} sizes={images.length === 1 ? "(max-width: 850px) 90vw, 800px" : "(max-width: 600px) 45vw, (max-width: 850px) 50vw, 400px"} />
                <span className={styles.tileOverlay} aria-hidden="true"><span>Ver de cerca</span><ArrowsPointingOutIcon /></span>
            </button>)}
        </div>}
        {!!videos.length && <div className={styles.videos}>
            {videos.map(({ asset, index }) => <figure key={`${asset.publicId}-${index}`}>
                <video controls preload="metadata" playsInline aria-label={asset.name || `Video ${index + 1}`} src={asset.url}>Tu navegador no admite este video.</video>
            </figure>)}
        </div>}
        <Dialog open={selected !== null} onClose={close} className={styles.viewer}>
            <div className={styles.backdrop} aria-hidden="true" />
            <div className={styles.viewerContainer}>
                <DialogPanel className={styles.panel}>
                    <header className={styles.toolbar}>
                        <DialogTitle className={styles.viewerTitle}>Una mirada más cerca</DialogTitle>
                        <div className={styles.controls}>
                            <button type="button" aria-label="Alejar imagen" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.5))}><MagnifyingGlassMinusIcon aria-hidden="true" /></button>
                            <button type="button" className={styles.zoomValue} aria-label="Restablecer zoom al 100 %" onClick={() => setZoom(1)}>{Math.round(zoom * 100)} %</button>
                            <button type="button" aria-label="Acercar imagen" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + 0.5))}><MagnifyingGlassPlusIcon aria-hidden="true" /></button>
                            <button type="button" aria-label="Cerrar imagen ampliada" data-autofocus onClick={close}><XMarkIcon aria-hidden="true" /></button>
                        </div>
                    </header>
                    <div className={styles.viewport} tabIndex={0} aria-label="Imagen ampliada; al acercar, desplázate para explorar los detalles">
                        <div className={styles.canvas} style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
                            {selected && <Image fill src={selected.asset.url} alt={imageAlt(selected.asset, selected.index)} sizes="100vw" className={styles.fullImage} />}
                        </div>
                    </div>
                    <footer className={styles.caption}>
                        <p>{selected && imageAlt(selected.asset, selected.index)}</p>
                        <span aria-live="polite">Zoom {Math.round(zoom * 100)} %{zoom > 1 ? " · Desplázate para explorar" : ""}</span>
                    </footer>
                </DialogPanel>
            </div>
        </Dialog>
    </section>;
}
