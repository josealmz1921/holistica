"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Form, type FormState } from "informed";
import Input from "@/src/components/Input";
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter, pointerWithin, type CollisionDetection, type DragEndEvent, type DragOverEvent, type KeyboardCoordinateGetter } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ArrowLeftIcon, ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, TrashIcon, ComputerDesktopIcon, DeviceTabletIcon, DevicePhoneMobileIcon, AdjustmentsHorizontalIcon, XMarkIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, Squares2X2Icon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { florDeLunaTheme } from "@/src/page-builder";
import { blockRegistry, getBlockFields, validatePageDocument, type BlockType, type PageDocument, type PageSection, type ValidationIssue } from "@/src/page-builder/editor";
import { adminHeaders } from "@/src/firebase/adminRequest";
import Fields, { UploadActivity, InlineEditingType } from "./Fields";
import { PREVIEW_KEY, pageHomeErrors } from "@/src/utilities/pageBuilder";
import { initialPage } from "./initialPage";
import { duplicateBlock, insertBlock, moveBlockToGap } from "./editorOperations";
import { CatalogBlock, InsertGap, SortableCanvasBlock, StructureBlock, CanvasFrame, BlockIcon } from "./BuilderParts";
import styles from "./builder.module.css";
import { updateInlineText } from './inlineEditing';
import { confirmBuilderAction, type BuilderConfirmation } from './confirmAction';

async function request(method = "GET", body?: unknown) {
    const response = await fetch("/api/admin/pages/home", { method, headers: await adminHeaders(), ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo completar la operación.");
    return result;
}

const devices = [
    { id: "desktop", label: "Escritorio", width: 1280, Icon: ComputerDesktopIcon },
    { id: "tablet", label: "Tablet", width: 768, Icon: DeviceTabletIcon },
    { id: "mobile", label: "Móvil", width: 390, Icon: DevicePhoneMobileIcon },
] as const;

function PageSettings({ page, disabled, onChange, onClose }: { page: PageDocument; disabled: boolean; onChange: (state: FormState) => void; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [values] = useState(() => ({ title: page.title, seoTitle: page.seo?.title || "", seoDescription: page.seo?.description || "" }));
    useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
    return <dialog ref={dialog} className={styles.settingsDialog} onCancel={onClose} aria-labelledby="page-settings-title">
        <div className={styles.dialogHeader}><div><span className={styles.eyebrow}>Configuración de página</span><h2 id="page-settings-title">Información y SEO</h2></div><button type="button" onClick={onClose} aria-label="Cerrar ajustes"><XMarkIcon /></button></div>
        <p className={styles.help}>El título y la descripción SEO se aplican al inicio cuando publiques. La URL canónica se conserva.</p>
        <fieldset disabled={disabled}><Form initialValues={values} onSubmit={() => {}} onValueChange={onChange}>
            <Input identifier="title" label="Nombre de la página" />
            <Input identifier="seoTitle" label="Título SEO" />
            <Input identifier="seoDescription" label="Descripción SEO" />
        </Form></fieldset>
        <button type="button" className={styles.dialogDone} onClick={onClose}>Volver al editor</button>
    </dialog>;
}

function dropIndex(event: DragOverEvent | DragEndEvent): number | null {
    const over = event.over;
    if (!over) return null;
    const target = over.data.current;
    if (target?.kind === "insert") return target.index as number;
    if (target?.kind === "block") {
        const rect = event.active.rect.current.translated;
        const pointerY = 'clientY' in event.activatorEvent ? Number(event.activatorEvent.clientY) + event.delta.y : rect ? rect.top + rect.height / 2 : over.rect.top;
        const after = pointerY > over.rect.top + over.rect.height / 2;
        return Number(target.index) + (after ? 1 : 0);
    }
    return null;
}

const collisionDetection: CollisionDetection = args => {
    const source = args.active.data.current;
    const droppableContainers = args.droppableContainers.filter(container => {
        const target = container.data.current;
        if (source?.kind === "catalog") return target?.kind === "insert" || (args.pointerCoordinates && target?.kind === "block" && target.source === "canvas");
        if (source?.source === "structure") return target?.kind === "block" && target.source === "structure";
        return target?.kind === "insert" || (target?.kind === "block" && target.source === "canvas");
    });
    const filtered = { ...args, droppableContainers };
    return args.pointerCoordinates ? pointerWithin(filtered) : closestCenter(filtered);
};

const builderKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
    if (args.context.active?.data.current?.kind !== 'catalog') return sortableKeyboardCoordinates(event, args);
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;
    event.preventDefault();
    const { droppableContainers, droppableRects, collisionRect, over } = args.context;
    if (!collisionRect) return;
    const targets = droppableContainers.getEnabled().filter(item => item.data.current?.kind === 'insert').sort((a, b) => a.data.current!.index - b.data.current!.index);
    const current = targets.findIndex(item => item.id === over?.id);
    const direction = event.code === 'ArrowUp' || event.code === 'ArrowLeft' ? -1 : 1;
    const next = targets[Math.max(0, Math.min(targets.length - 1, current + direction))];
    const rect = next && droppableRects.get(next.id);
    if (rect) return { x: rect.left + rect.width / 2 - collisionRect.width / 2, y: rect.top + rect.height / 2 - collisionRect.height / 2 };
};

export default function PageEditor({ view = "list" }: { view?: "list" | "editor" }) {
    const [document, setDocument] = useState<PageDocument>(initialPage);
    const [revision, setRevision] = useState(0);
    const [published, setPublished] = useState<number | null>(null);
    const [saved, setSaved] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [uploads, setUploads] = useState(0);
    const [loadFailed, setLoadFailed] = useState(false);
    const pending = useRef(false);
    const confirmationPending = useRef(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [issues, setIssues] = useState<ValidationIssue[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tab, setTab] = useState<"blocks" | "structure">("blocks");
    const [panel, setPanel] = useState<"catalog" | "properties" | null>(null);
    const [inspectorOpen, setInspectorOpen] = useState(true);
    const [seoOpen, setSeoOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deviceId, setDeviceId] = useState<string>("desktop");
    const [scale, setScale] = useState(1);
    const [insertAt, setInsertAt] = useState<number | null>(null);
    const [dragLabel, setDragLabel] = useState<string | null>(null);
    const [dragType, setDragType] = useState<BlockType | null>(null);
    const [dropAt, setDropAt] = useState<number | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(KeyboardSensor, { coordinateGetter: builderKeyboardCoordinates }));

    useEffect(() => {
        let cancelled = false;
        request().then(result => {
            if (cancelled) return;
            if (result.document) {
                const parsed = validatePageDocument(result.document, { mode: "draft" });
                if (!parsed.success) throw new Error("El borrador guardado no es compatible con esta versión.");
                setDocument(parsed.data); setSaved(JSON.stringify(parsed.data)); setSelectedId(parsed.data.sections[0]?.id ?? null);
            } else {
                const template = initialPage();
                setDocument(template); setSelectedId(template.sections[0]?.id ?? null);
                setMessage("Contenido actual precargado solo en esta edición local. Las copias de secciones existentes están ocultas para evitar duplicados. Revisa y guarda el borrador cuando quieras.");
            }
            setRevision(result.revision); setPublished(result.publishedRevision);
        }).catch(reason => { if (!cancelled) { setError(reason.message); setLoadFailed(true); } }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const validation = validatePageDocument(document, { mode: "draft" });
    const imageErrors = validation.success ? pageHomeErrors(validation.data) : [];
    const dirty = JSON.stringify(document) !== saved;
    const disabled = busy || uploads > 0 || loadFailed || confirmationOpen;
    const selectedIndex = document.sections.findIndex(block => block.id === selectedId);
    const selected = document.sections[selectedIndex];
    const device = devices.find(item => item.id === deviceId) || devices[0];
    const status = published === null ? "Borrador" : revision === published ? "Publicada" : "Cambios sin publicar";
    const selectedFields = selected ? getBlockFields(selected.type) : [];
    const currentIssues = issues.length ? issues : validation.success ? [] : validation.issues;

    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);
    useEffect(() => {
        if (!panel) return;
        const close = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
        window.addEventListener("keydown", close);
        return () => window.removeEventListener("keydown", close);
    }, [panel]);

    const updateMetadata = useCallback(({ values }: FormState) => {
        const title = String(values.title ?? "");
        const seoTitle = String(values.seoTitle ?? "");
        const description = String(values.seoDescription ?? "");
        setDocument(current => {
            if (current.title === title && (current.seo?.title || "") === seoTitle && (current.seo?.description || "") === description) return current;
            return { ...current, title, seo: seoTitle || description ? { title: seoTitle, description } : undefined };
        });
    }, []);

    function change(next: PageDocument) { if (disabled) return; setDocument(next); setMessage(""); setError(""); setIssues([]); }
    function select(id: string) { setSelectedId(id); setInsertAt(null); }
    async function confirmAction(action: BuilderConfirmation) {
        if (disabled || pending.current || confirmationPending.current) return false;
        confirmationPending.current = true; setConfirmationOpen(true);
        try { return await confirmBuilderAction(action); }
        catch { setError("No se pudo abrir la confirmación. Inténtalo de nuevo."); return false; }
        finally { confirmationPending.current = false; setConfirmationOpen(false); }
    }
    async function loadSiteContent() {
        if (!(await confirmAction('load'))) return;
        const template = initialPage();
        change(template); setSelectedId(template.sections[0]?.id ?? null);
        setTab("structure"); setPanel(null); setSeoOpen(false); setInsertAt(null);
        setMessage("Contenido del inicio cargado localmente. Revisa los bloques ocultos en Estructura. No se ha guardado ni publicado ningún cambio.");
    }
    function updateBlock(index: number, next: PageSection) {
        if (index === selectedIndex) setSelectedId(next.id);
        change({ ...document, sections: document.sections.map((block, position) => position === index ? next : block) });
    }
    function add(type: BlockType, index = insertAt ?? (selectedIndex >= 0 ? selectedIndex + 1 : document.sections.length)) {
        if (disabled || document.sections.length >= 100) return;
        const id = `bloque-${crypto.randomUUID()}`;
        change(insertBlock(document, type, index, id)); select(id); setPanel(null);
        setMessage(`${blockRegistry[type].label} añadido al borrador. Completa sus propiedades antes de publicar.`);
    }
    function duplicate(index: number) {
        const id = `bloque-${crypto.randomUUID()}`;
        change(duplicateBlock(document, index, id)); select(id);
    }
    async function remove(index: number) {
        if (!(await confirmAction('remove'))) return;
        const sections = document.sections.filter((_, position) => position !== index);
        change({ ...document, sections }); setSelectedId(sections[Math.max(0, index - 1)]?.id ?? null);
    }
    function move(index: number, delta: number) {
        const to = index + delta;
        if (to < 0 || to >= document.sections.length) return;
        change({ ...document, sections: moveBlockToGap(document.sections, index, to > index ? to + 1 : to) });
    }
    async function persist(action: "save" | "publish") {
        if (pending.current || confirmationPending.current || uploads || loadFailed) return;
        if (action === "publish" && (dirty || !revision)) { setError("Guarda el borrador antes de publicar."); return; }
        if (action === "publish" && !(await confirmAction('publish'))) return;
        const check = validatePageDocument(document, { mode: action === "save" ? "draft" : "publish" });
        if (!check.success) { setIssues(check.issues); setError("Revisa los campos señalados antes de continuar."); return; }
        if (imageErrors.length) { setError(imageErrors.join(" ")); return; }
        pending.current = true; setBusy(true); setError(""); setMessage("");
        try {
            const result = await request(action === "save" ? "PUT" : "POST", action === "save" ? { document: check.data, revision } : { revision });
            if (action === "save") { setDocument(check.data); setSaved(JSON.stringify(check.data)); setRevision(result.revision); }
            else setPublished(result.revision);
            setMessage(action === "save" ? "Borrador guardado. El sitio no ha cambiado." : "Versión publicada. El inicio mostrará los bloques y el SEO publicados, salvo que la integración esté desactivada en el servidor.");
        } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar."); }
        finally { pending.current = false; setBusy(false); }
    }
    function openPreview(width: number) {
        if (!validation.success || imageErrors.length) { setError("Corrige los campos o las imágenes antes de abrir la vista previa."); return; }
        try {
            sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(validation.data));
            const opened = window.open("/builder-preview", "_blank", `popup,width=${width},height=900`);
            if (!opened) setError("Permite ventanas emergentes para ver la vista previa a tamaño real.");
        } catch { setError("El navegador no permite guardar la vista previa local."); }
    }
    function endDrag(event: DragEndEvent) {
        setDragLabel(null); setDragType(null); setDropAt(null);
        if (!event.over || disabled) return;
        const source = event.active.data.current;
        const gap = dropIndex(event);
        if (source?.kind === "catalog" && gap !== null) { add(source.type, gap); return; }
        if (source?.kind !== "block") return;
        const from = document.sections.findIndex(block => block.id === source.blockId);
        if (source.source === "structure") {
            const to = document.sections.findIndex(block => block.id === event.over?.data.current?.blockId);
            if (to >= 0 && to !== from) change({ ...document, sections: moveBlockToGap(document.sections, from, to > from ? to + 1 : to) });
        } else if (gap !== null) change({ ...document, sections: moveBlockToGap(document.sections, from, gap) });
        setMessage("Orden actualizado en el borrador. Guarda para conservarlo.");
    }

    const notices = <>
        {error && <div role="alert" className={styles.error}>{error}{loadFailed && <button type="button" onClick={() => window.location.reload()}>Volver a cargar</button>}</div>}
        {message && <p role="status" className={styles.success}><CheckCircleIcon />{message}</p>}
        {uploads > 0 && <p role="status" className={styles.notice}>Subiendo imágenes… Espera antes de guardar.</p>}
    </>;

    if (loading) return <div className={styles.loading} role="status">Cargando tu espacio de páginas…</div>;

    if (view === "list") {
        const matches = document.title.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "all" || status === statusFilter);
        return <div className={`${styles.root} ${styles.listRoot}`} style={florDeLunaTheme}>
            <header className={styles.listHeader}><div><span className={styles.eyebrow}>Contenido del sitio</span><h1>Páginas</h1><p>Da forma a tu sitio, bloque a bloque.</p></div><Link className={styles.primaryLink} href="/dashboard/pages/home"><Squares2X2Icon />{revision ? "Abrir constructor" : "Configurar inicio"}</Link></header>
            {notices}
            <div className={styles.listSummary}><span className={styles.summaryIcon}><Squares2X2Icon /></span><div><strong>Un espacio, muchas posibilidades</strong><p>Edita contenido, explora variantes y prepara cada cambio antes de publicarlo.</p></div><span className={styles.badge}>1 página disponible</span></div>
            <section className={styles.listCard} aria-label="Listado de páginas">
                <div className={styles.listFilters}><label className={styles.search}><MagnifyingGlassIcon /><input aria-label="Buscar páginas" placeholder="Buscar una página…" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Filtrar por estado" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">Todos los estados</option>{["Borrador", "Publicada", "Cambios sin publicar"].map(item => <option key={item}>{item}</option>)}</select></div>
                <div className={styles.tableScroll}><table className={styles.pagesTable}><thead><tr><th>Página</th><th>Ruta</th><th>Estado</th><th>Versión guardada</th><th>Acciones</th></tr></thead><tbody>{matches ? <tr><td><div className={styles.pageName}><span className={styles.pageThumbnail}><Squares2X2Icon /></span><div><Link href="/dashboard/pages/home">{document.title}</Link><small>Portada · {document.sections.length} bloques</small></div></div></td><td><code>/</code></td><td><span className={styles.badge}>{status}</span></td><td>{revision ? `Revisión ${revision}` : "Aún sin guardar"}</td><td><div className={styles.tableActions}><Link href="/dashboard/pages/home">Editar página</Link><button type="button" disabled={disabled} onClick={() => openPreview(1280)} aria-label="Vista previa de inicio"><ArrowTopRightOnSquareIcon /></button></div></td></tr> : <tr><td colSpan={5} className={styles.noResults}>No hay páginas que coincidan con tu búsqueda.</td></tr>}</tbody></table></div>
                <p className={styles.tableFooter}>Guardar no cambia el sitio. Publicar actualiza los bloques iniciales y el SEO; servicios, terapeuta, blog y secciones actuales se conservan debajo.</p>
            </section>
        </div>;
    }

    return <div className={styles.root} style={florDeLunaTheme}>
        <header className={styles.editorHeader}>
            <div className={styles.pageContext}><Link href="/dashboard/pages" aria-label="Volver a páginas"><ArrowLeftIcon /></Link><div><h1>{document.title || "Página sin nombre"}</h1><span className={styles.saveState}>{dirty ? "Cambios sin guardar" : `Guardado · revisión ${revision}`}</span></div><span className={styles.badge}>{status}</span></div>
            <div className={styles.headerActions}>
                <button type="button" disabled={disabled} onClick={loadSiteContent}>Cargar contenido actual</button>
                <button type="button" onClick={() => setSeoOpen(true)} title="Información y SEO"><AdjustmentsHorizontalIcon /><span>Ajustes y SEO</span></button>
                <button type="button" disabled={disabled} onClick={() => openPreview(device.width)}><EyeIcon /><span>Vista previa ↗</span></button>
                <button type="button" disabled={disabled} onClick={() => persist("save")}>{busy ? "Procesando…" : "Guardar borrador"}</button>
                <button type="button" className={styles.primary} disabled={disabled || dirty || !revision} onClick={() => persist("publish")}>Publicar</button>
            </div>
        </header>
        <div className={styles.workspaceBar}>
            <div className={styles.panelToggles}><button type="button" aria-expanded={panel === "catalog"} onClick={() => setPanel(panel === "catalog" ? null : "catalog")}><Squares2X2Icon />Bloques</button><button type="button" aria-expanded={panel === "properties"} onClick={() => { setInspectorOpen(true); setPanel(panel === "properties" ? null : "properties"); }}><AdjustmentsHorizontalIcon />Propiedades</button></div>
            <div className={styles.deviceSwitcher} aria-label="Ancho del lienzo">{devices.map(({ id, label, Icon }) => <button type="button" key={id} aria-label={`Vista ${label}`} aria-pressed={deviceId === id} onClick={() => setDeviceId(id)}><Icon /><span>{label}</span></button>)}</div>
            <span className={styles.zoomLabel}>{device.width} px · {Math.round(scale * 100)}%</span>
        </div>
        <div className={styles.editorNotices}>{notices}</div>
        <UploadActivity value={delta => setUploads(current => current + delta)}>
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={({ active }) => { const data = active.data.current; const block = document.sections.find(block => block.id === data?.blockId); setDragType(data?.kind === 'catalog' ? data.type : block?.type ?? null); setDragLabel(data?.kind === "catalog" ? blockRegistry[data.type as BlockType].label : block?.content.title || "Bloque"); if (data?.kind === 'catalog') setPanel(null); }} onDragOver={event => setDropAt(dropIndex(event))} onDragMove={event => setDropAt(dropIndex(event))} onDragEnd={endDrag} onDragCancel={() => { setDragLabel(null); setDragType(null); setDropAt(null); }} accessibility={{ screenReaderInstructions: { draggable: "Pulsa espacio para iniciar el arrastre, las flechas para mover y espacio para soltar. Escape cancela. También puedes utilizar los botones de subir y bajar." } }}>
        <div className={`${styles.workspace} ${!inspectorOpen ? styles.inspectorClosed : ""}`}>
            {panel && <button type="button" className={styles.drawerBackdrop} aria-label="Cerrar panel lateral" onClick={() => setPanel(null)} />}
            <aside aria-label="Catálogo y estructura" className={`${styles.catalog} ${panel === "catalog" ? styles.drawerOpen : ""}`}>
                <div className={styles.panelHeading}><strong>Construye tu página</strong><button type="button" className={styles.drawerClose} onClick={() => setPanel(null)} aria-label="Cerrar catálogo"><XMarkIcon /></button></div>
                <div className={styles.tabs}><button type="button" aria-pressed={tab === "blocks"} onClick={() => setTab("blocks")}>Bloques</button><button type="button" aria-pressed={tab === "structure"} onClick={() => setTab("structure")}>Estructura</button></div>
                <div className={styles.panelBody}>
                    {tab === "blocks" ? <>
                        <p className={styles.help}>{insertAt === null ? "Arrastra cualquier tarjeta al lienzo y suéltala en el espacio resaltado. También puedes usar +." : `El siguiente bloque se insertará en la posición ${insertAt + 1}.`}</p>
                        <span className={styles.eyebrow}>Diseño y contenido</span>
                        {(Object.keys(blockRegistry) as BlockType[]).map(type => <CatalogBlock key={type} type={type} disabled={disabled || document.sections.length >= 100} onAdd={() => add(type)} />)}
                    </> : <><p className={styles.help}>Arrastra desde el asa para cambiar el orden. Selecciona un bloque para editarlo.</p><SortableContext items={document.sections.map(block => `structure-${block.id}`)} strategy={verticalListSortingStrategy}>{document.sections.map((block, index) => <StructureBlock key={block.id} block={block} index={index} selected={block.id === selectedId} disabled={disabled} onSelect={() => select(block.id)} />)}</SortableContext>{!document.sections.length && <p className={styles.help}>Todavía no hay bloques. Agrega el primero desde el catálogo.</p>}</>}
                </div>
                <div className={styles.panelFooter}>{document.sections.length} / 100 bloques · Portada de inicio</div>
            </aside>
            <section className={styles.canvasArea} aria-label="Lienzo de la página">
                <div className={styles.canvasCaption}><span>INICIO <span className={styles.captionDivider}>/</span> LIENZO DE EDICIÓN</span><span>{device.label}</span></div>
                <CanvasFrame width={device.width} onScale={setScale}>
                    <SortableContext items={document.sections.map(block => `canvas-${block.id}`)} strategy={verticalListSortingStrategy}>
                        <InsertGap index={0} highlighted={dropAt === 0} dragging={!!dragLabel} disabled={disabled} onInsert={() => { setInsertAt(0); setTab("blocks"); setPanel("catalog"); }} />
                        {document.sections.map((block, index) => {
                            const blockValidation = validatePageDocument({ ...document, sections: [block] }, { mode: "draft" });
                            const valid = blockValidation.success && !pageHomeErrors(blockValidation.data).length;
                            return <div key={block.id}>
                                <SortableCanvasBlock block={block} index={index} page={document} selected={block.id === selectedId} disabled={disabled} scale={scale} valid={valid} onSelect={() => select(block.id)} onTextChange={(path, value) => updateBlock(index, updateInlineText(block, path, value))} toolbar={<>
                                    <button type="button" disabled={disabled || !index} onClick={() => move(index, -1)} aria-label={`Subir bloque ${index + 1}`}><ArrowUpIcon /></button>
                                    <button type="button" disabled={disabled || index === document.sections.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar bloque ${index + 1}`}><ArrowDownIcon /></button>
                                    <button type="button" disabled={disabled || document.sections.length >= 100} onClick={() => duplicate(index)} aria-label={`Duplicar bloque ${index + 1}`}><DocumentDuplicateIcon /></button>
                                    <button type="button" disabled={disabled} onClick={() => updateBlock(index, { ...block, visible: !block.visible })} aria-label={`${block.visible ? "Ocultar" : "Mostrar"} bloque ${index + 1}`}>{block.visible ? <EyeIcon /> : <EyeSlashIcon />}</button>
                                    <button type="button" className={styles.danger} disabled={disabled} onClick={() => remove(index)} aria-label={`Eliminar bloque ${index + 1}`}><TrashIcon /></button>
                                </>} />
                                <InsertGap index={index + 1} highlighted={dropAt === index + 1} dragging={!!dragLabel} disabled={disabled} onInsert={() => { setInsertAt(index + 1); setTab("blocks"); setPanel("catalog"); }} />
                            </div>;
                        })}
                    </SortableContext>
                    {!document.sections.length && <div className={styles.emptyCanvas}><Squares2X2Icon /><h2>Tu página empieza aquí</h2><p>Arrastra un bloque del catálogo o agrega una portada para empezar.</p><button type="button" disabled={disabled} onClick={() => add("hero", 0)}>Agregar primer bloque</button></div>}
                </CanvasFrame>
                <p className={styles.canvasHint}>Haz clic en los textos para escribir. Arrastra las tarjetas del catálogo para añadir bloques. Los cambios son locales hasta guardar.</p>
            </section>
            <aside aria-label="Propiedades del bloque" className={`${styles.inspector} ${!inspectorOpen ? styles.hideInspector : ""} ${panel === "properties" ? styles.drawerOpen : ""}`}>
                <div className={styles.panelHeading}><div><span className={styles.eyebrow}>Inspector de bloque</span><h2>{selected ? blockRegistry[selected.type].label : "Propiedades"}</h2></div><button type="button" aria-label="Cerrar propiedades" onClick={() => { setPanel(null); setInspectorOpen(false); }}><XMarkIcon /></button></div>
                {selected ? <fieldset disabled={disabled} className={styles.inspectorFields} key={selectedIndex}>
                    <div className={styles.variantPicker}><span className={styles.eyebrow}>Variante de diseño</span><div>{blockRegistry[selected.type].variants.map(variant => <button type="button" key={variant} aria-pressed={selected.variant === variant} onClick={() => updateBlock(selectedIndex, { ...selected, variant } as PageSection)}><span className={`${styles.variantMiniature} ${styles[`mini-${variant}`]}`} aria-hidden="true"><i /><i /><i /></span><span>{({ default: "Simple", "image-top": "Imagen arriba", "image-left": "Imagen izquierda", "image-right": "Imagen derecha", featured: "Destacada", compact: "Compacta", left: "Izquierda", center: "Centro", right: "Derecha", top: "Arriba", bottom: "Abajo", background: "Fondo" } as Record<string, string>)[variant] || variant}</span></button>)}</div></div>
                    <p className={styles.inspectorTip}>Edita los textos directamente en el lienzo. Aquí puedes configurar imágenes, destinos y colecciones.</p>
                    <details open className={styles.inspectorGroup}><summary>Imágenes, enlaces y elementos</summary><div><InlineEditingType value={selected.type}><Fields prefix={`block-${selectedIndex}`} path={`page.sections[${selectedIndex}]`} issues={currentIssues} fields={selectedFields.filter(field => field.name === "content")} value={selected as unknown as Record<string, unknown>} onChange={next => updateBlock(selectedIndex, next as unknown as PageSection)} /></InlineEditingType></div></details>
                    <details open className={styles.inspectorGroup}><summary>Apariencia</summary><div><Fields prefix={`appearance-${selectedIndex}`} path={`page.sections[${selectedIndex}]`} issues={currentIssues} fields={selectedFields.filter(field => ["tone", "columns", "settings"].includes(field.name))} value={selected as unknown as Record<string, unknown>} onChange={next => updateBlock(selectedIndex, next as unknown as PageSection)} /></div></details>
                    <details className={styles.inspectorGroup}><summary>Configuración</summary><div><Fields prefix={`config-${selectedIndex}`} path={`page.sections[${selectedIndex}]`} issues={currentIssues} fields={selectedFields.filter(field => ["id", "visible", "navigationLabel"].includes(field.name))} value={selected as unknown as Record<string, unknown>} onChange={next => updateBlock(selectedIndex, next as unknown as PageSection)} /></div></details>
                    <div className={styles.inspectorActions}><button type="button" disabled={!selectedIndex} onClick={() => move(selectedIndex, -1)}><ArrowUpIcon />Subir</button><button type="button" disabled={selectedIndex === document.sections.length - 1} onClick={() => move(selectedIndex, 1)}><ArrowDownIcon />Bajar</button></div>
                </fieldset> : <div className={styles.inspectorEmpty}><span className={styles.blockIcon}><BlockIcon type="text" /></span><h3>Cada detalle cuenta</h3><p>Selecciona un bloque en el lienzo para editar su contenido y apariencia.</p></div>}
            </aside>
        </div>
        <DragOverlay dropAnimation={null}>{dragLabel && <div className={styles.dragOverlay}><div className={styles.dragMiniature} aria-hidden="true">{dragType && <BlockIcon type={dragType} />}<i /><i /><i /></div><div><strong>{dragLabel}</strong><span>Suelta en el espacio resaltado</span></div></div>}</DragOverlay>
        </DndContext>
        </UploadActivity>
        {currentIssues.length > 0 && <details className={styles.validationSummary}><summary>{currentIssues.length} campos por revisar</summary><ul>{currentIssues.map((issue, index) => <li key={`${issue.path}-${index}`}>{issue.path}: {issue.message}</li>)}</ul></details>}
        {seoOpen && <PageSettings page={document} disabled={disabled} onChange={updateMetadata} onClose={() => setSeoOpen(false)} />}
    </div>;
}
