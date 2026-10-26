"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowsUpDownIcon, PlusIcon, RectangleGroupIcon, DocumentTextIcon, PhotoIcon, Squares2X2Icon, WindowIcon } from "@heroicons/react/24/outline";
import { PageRenderer, florDeLunaTheme } from "@/src/page-builder";
import { blockRegistry, type BlockType, type PageDocument, type PageSection } from "@/src/page-builder/editor";
import { blockDescriptions } from "./editorOperations";
import styles from "./builder.module.css";
import InlineText from './InlineText';
import { inlineTextFields } from './inlineEditing';

export function BlockIcon({ type }: { type: BlockType }) {
    const Icon = { hero: WindowIcon, text: DocumentTextIcon, banner: PhotoIcon, cards: Squares2X2Icon, projects: RectangleGroupIcon }[type];
    return <Icon aria-hidden="true" />;
}

export function CatalogBlock({ type, disabled, onAdd }: { type: BlockType; disabled: boolean; onAdd: () => void }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `catalog-${type}`, data: { kind: "catalog", type }, disabled });
    return <div ref={setNodeRef} className={`${styles.catalogCard} ${isDragging ? styles.dragging : ""}`}>
        <button ref={setActivatorNodeRef} type="button" className={styles.catalogDragCard} disabled={disabled} aria-label={`Arrastrar ${blockRegistry[type].label} al lienzo`} {...attributes} {...listeners}>
        <span className={styles.blockIcon}><BlockIcon type={type} /></span>
        <div className={styles.catalogLabel}><strong>{blockRegistry[type].label}</strong><span>{blockDescriptions[type]}</span></div>
        <ArrowsUpDownIcon aria-hidden="true" />
        <span className={styles.catalogDragHint}>Arrastra al lienzo</span>
        </button>
        <button type="button" className={styles.catalogAdd} disabled={disabled} aria-label={`Agregar ${blockRegistry[type].label}`} onClick={onAdd}><PlusIcon /></button>
    </div>;
}

export function InsertGap({ index, highlighted, dragging, disabled, onInsert }: { index: number; highlighted: boolean; dragging: boolean; disabled: boolean; onInsert: () => void }) {
    const { setNodeRef, isOver } = useDroppable({ id: `insert-${index}`, data: { kind: "insert", index }, disabled });
    return <div ref={setNodeRef} className={`${styles.insertGap} ${dragging ? styles.insertDragging : ""} ${highlighted || isOver ? styles.insertActive : ""}`}>
        <span /><button type="button" disabled={disabled} onClick={onInsert} aria-label={`Insertar bloque en posición ${index + 1}`}><PlusIcon />{dragging ? "Suelta el bloque aquí" : "Insertar bloque"}</button><span />
    </div>;
}

export function SortableCanvasBlock({ block, index, page, selected, disabled, scale, valid, onSelect, onTextChange, toolbar }: {
    block: PageSection; index: number; page: PageDocument; selected: boolean; disabled: boolean; scale: number;
    valid: boolean; onSelect: () => void; onTextChange: (path: string, value: string) => void; toolbar: ReactNode;
}) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: `canvas-${block.id}`, data: { kind: "block", source: "canvas", blockId: block.id, index }, disabled });
    const fields = inlineTextFields(block);
    function renderText(path: string, value: string) {
        const field = fields.find(item => item.path === path);
        return field ? <InlineText value={value} label={field.label} multiline={field.multiline} disabled={disabled} onChange={next => onTextChange(path, next)} onSelect={onSelect} /> : value;
    }
    return <div ref={setNodeRef} style={{ transform: transform ? CSS.Translate.toString({ ...transform, x: transform.x / scale, y: transform.y / scale }) : undefined, transition }} className={`${styles.canvasBlock} ${selected ? styles.selectedBlock : ""} ${isDragging ? styles.dragging : ""}`}>
        <div className={styles.blockBar}>
            <button type="button" className={styles.blockLabel} onClick={onSelect}><BlockIcon type={block.type} />{blockRegistry[block.type].label}{!block.visible && " · Oculto"}</button>
            <div className={styles.blockTools}>
                <button ref={setActivatorNodeRef} className={styles.dragHandle} type="button" disabled={disabled} aria-label={`Mover bloque ${block.content.title || index + 1}`} {...attributes} {...listeners}><ArrowsUpDownIcon /></button>
                {toolbar}
            </div>
        </div>
        <div className={styles.blockSurface} onClick={onSelect} onClickCapture={event => { if ((event.target as HTMLElement).closest('a, button')) event.preventDefault(); }}>
            <div className={styles.blockRender}>
                {!block.visible && <p className={styles.hiddenNotice}>Bloque oculto · No se mostrará en la página</p>}
                {valid ? <PageRenderer document={{ ...page, sections: [{ ...block, visible: true }] }} mode="draft" theme={florDeLunaTheme} renderText={(_, path, value) => renderText(path, value)} /> : <div className={styles.canvasFallback}><p className={styles.help}>Puedes editar los textos aquí. Revisa imágenes y enlaces en la configuración para recuperar el diseño.</p>{fields.map(field => <div key={field.path}><small>{field.label}</small>{renderText(field.path, field.value)}</div>)}</div>}
            </div>
        </div>
    </div>;
}

export function StructureBlock({ block, index, selected, disabled, onSelect }: { block: PageSection; index: number; selected: boolean; disabled: boolean; onSelect: () => void }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: `structure-${block.id}`, data: { kind: "block", source: "structure", blockId: block.id, index }, disabled });
    return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`${styles.structureBlock} ${selected ? styles.structureSelected : ""} ${isDragging ? styles.dragging : ""}`}>
        <button ref={setActivatorNodeRef} type="button" className={styles.dragHandle} aria-label={`Ordenar ${block.content.title || index + 1}`} {...attributes} {...listeners} disabled={disabled}><ArrowsUpDownIcon /></button>
        <button type="button" className={styles.structureLabel} onClick={onSelect}><span>{String(index + 1).padStart(2, "0")} · {blockRegistry[block.type].label}</span><strong>{block.content.title || "Sin título"}</strong>{!block.visible && <small>Oculto</small>}</button>
    </div>;
}

/** Fixed logical width, scaled to available space. Descendants use container queries. */
export function CanvasFrame({ width, children, onScale }: { width: number; children: ReactNode; onScale: (scale: number) => void }) {
    const viewport = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ available: width, height: 600 });
    const scale = Math.min(1, dimensions.available / width);
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (viewport.current && content.current) setDimensions({ available: Math.max(1, viewport.current.clientWidth), height: content.current.offsetHeight });
        });
        if (viewport.current) observer.observe(viewport.current);
        if (content.current) observer.observe(content.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => { onScale(scale); }, [scale, onScale]);
    return <div ref={viewport} className={styles.canvasViewport}>
        <div style={{ width: width * scale, height: dimensions.height * scale, marginInline: "auto" }}>
            <div ref={content} className={styles.canvasPaper} style={{ width, transform: `scale(${scale})`, "--builder-scale": scale } as CSSProperties}>{children}</div>
        </div>
    </div>;
}
