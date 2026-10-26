"use client";
import { createContext, useContext, useRef, useState } from "react";
import type { BlockType, EditorField, ValidationIssue } from "@/src/page-builder/editor";
import { isInlineField } from './inlineEditing';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Dropzone from "@/src/components/Dropzone";
import type { PreviewFile } from "@/src/components/Dropzone/types";
import { uploadImage } from "@/src/utilities/cloudinary";
import styles from "./builder.module.css";

type Values = Record<string, unknown>;
export const UploadActivity = createContext<(delta: number) => void>(() => {});
export const InlineEditingType = createContext<BlockType | null>(null);
export function blankFields(fields: readonly EditorField[]): Values {
    return Object.fromEntries(fields.filter(field => field.required).map(field => [field.name,
        field.kind === "object" ? blankFields(field.fields || []) : field.kind === "list" ? [] : field.kind === "boolean" ? true : field.kind === "select" ? field.options?.[0] : field.name === "id" ? `item-${crypto.randomUUID()}` : "",
    ]));
}

function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (url: string) => void }) {
    const handled = useRef(new WeakSet<File>());
    const activity = useContext(UploadActivity);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    async function select(files: PreviewFile[]) {
        const file = files[0]?.file;
        if (!file || handled.current.has(file)) return;
        handled.current.add(file); setBusy(true); activity(1); setError("");
        try { const result = await uploadImage(file); onChange(result.secure_url); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo subir la imagen."); }
        finally { setBusy(false); activity(-1); }
    }
    return <div>
        <input id={id} value={value} onChange={event => onChange(event.target.value)} placeholder="/img/imagen.jpg o URL de tu Cloudinary" />
        <Dropzone key={value} maxFiles={1} maxImageSize={5 * 1024 * 1024} disabled={busy} getValues={select} />
        {busy && <p role="status">Subiendo imagen… Espera antes de guardar.</p>}
        {error && <p role="alert">{error}</p>}
        <p className={styles.help}>Subida firmada existente. Quitar una referencia no elimina el archivo de Cloudinary.</p>
    </div>;
}

interface FieldsProps { fields: readonly EditorField[]; value: Values; onChange: (next: Values) => void; prefix: string; path?: string; issues?: ValidationIssue[] }

function SortableListItem({ id, index, item, fields, prefix, path, issues, total, onChange, onMove, onRemove }: { id: string; index: number; item: Values; fields: readonly EditorField[]; prefix: string; path: string; issues: ValidationIssue[]; total: number; onChange: (next: Values) => void; onMove: (delta: number) => void; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
    const title = String(item.title || item.label || item.text || `Elemento ${index + 1}`);
    return <div ref={setNodeRef} className={`${styles.listItem} ${isDragging ? styles.dragging : ""}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
        <button ref={setActivatorNodeRef} type="button" className={styles.dragHandle} aria-label={`Arrastrar elemento ${index + 1}`} {...attributes} {...listeners}><ArrowsUpDownIcon /></button>
        <details open={total === 1} className={styles.itemDetails}><summary><span>{String(index + 1).padStart(2, "0")}</span>{title}</summary>
            <Fields prefix={`${prefix}-${index}`} path={`${path}[${index}]`} issues={issues} fields={fields} value={item} onChange={onChange} />
        </details>
        <div className={styles.itemActions}>
            <button type="button" disabled={!index} onClick={() => onMove(-1)} aria-label={`Subir elemento ${index + 1}`}><ArrowUpIcon /></button>
            <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Bajar elemento ${index + 1}`}><ArrowDownIcon /></button>
            <button type="button" className={styles.danger} onClick={onRemove} aria-label={`Quitar elemento ${index + 1}`}><TrashIcon /></button>
        </div>
    </div>;
}

function ListField({ field, items, prefix, path, issues, onChange }: { field: EditorField; items: Values[]; prefix: string; path: string; issues: ValidationIssue[]; onChange: (next: Values[]) => void }) {
    const [keys, setKeys] = useState(() => items.map((_, index) => `${prefix}-row-${index}`));
    const currentKeys = items.map((_, index) => keys[index] || `${prefix}-row-${index}`);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    function move(from: number, to: number) {
        if (to < 0 || to >= items.length) return;
        setKeys(arrayMove(currentKeys, from, to)); onChange(arrayMove(items, from, to));
    }
    return <fieldset className={styles.group}><legend>{field.label} <span className={styles.itemCount}>{items.length}</span></legend>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => { if (!over || over.id === active.id) return; const from = currentKeys.indexOf(String(active.id)); const to = currentKeys.indexOf(String(over.id)); if (from >= 0 && to >= 0) move(from, to); }}>
            <SortableContext items={currentKeys} strategy={verticalListSortingStrategy}>
                {items.map((item, index) => <SortableListItem key={currentKeys[index]} id={currentKeys[index]} index={index} item={item} total={items.length} fields={field.fields || []} prefix={prefix} path={path} issues={issues} onChange={next => onChange(items.map((entry, position) => position === index ? next : entry))} onMove={delta => move(index, index + delta)} onRemove={() => { setKeys(currentKeys.filter((_, position) => position !== index)); onChange(items.filter((_, position) => position !== index)); }} />)}
            </SortableContext>
        </DndContext>
        {!items.length && <p className={styles.help}>Aún no hay elementos en esta colección.</p>}
        <button type="button" className={styles.addItem} disabled={items.length >= (field.max || 100)} onClick={() => { setKeys([...currentKeys, `item-${crypto.randomUUID()}`]); onChange([...items, blankFields(field.fields || [])]); }}><PlusIcon />Agregar elemento</button>
    </fieldset>;
}

export default function Fields({ fields, value, onChange, prefix, path = "", issues = [] }: FieldsProps) {
    const inlineType = useContext(InlineEditingType);
    const update = (name: string, next: unknown) => {
        const result = { ...value };
        if (next === undefined) delete result[name]; else result[name] = next;
        onChange(result);
    };
    return <>{fields.map(field => {
        if (inlineType && isInlineField(field, inlineType)) return null;
        const data = value[field.name];
        const id = `${prefix}-${field.name}`;
        const fieldPath = `${path}.${field.name}`;
        const fieldErrors = issues.filter(issue => issue.path === fieldPath);
        if (field.kind === "object") return <fieldset key={field.name} className={styles.group}>
            <legend>{field.label}</legend>
            {data !== undefined ? <><Fields prefix={id} path={fieldPath} issues={issues} fields={field.fields || []} value={data as Values} onChange={next => update(field.name, next)} />{!field.required && <button type="button" className={styles.removeOptional} onClick={() => update(field.name, undefined)}>Quitar {field.label.toLowerCase()}</button>}</> : <button type="button" className={styles.addItem} onClick={() => update(field.name, blankFields(field.fields || []))}><PlusIcon />Agregar {field.label.toLowerCase()}</button>}
        </fieldset>;
        if (field.kind === "list") {
            const items = (data || []) as Values[];
            return <ListField key={field.name} field={field} items={items} prefix={id} path={fieldPath} issues={issues} onChange={next => update(field.name, next)} />;
        }
        return <div key={field.name} className={styles.field} data-invalid={fieldErrors.length ? "true" : undefined}>
            <label htmlFor={id}>{field.label}{field.required ? " *" : ""}</label>
            {field.kind === "boolean" ? <input id={id} type="checkbox" checked={Boolean(data)} onChange={event => update(field.name, event.target.checked)} />
                : field.kind === "select" ? <select id={id} value={String(data ?? "")} onChange={event => { const selected = field.options?.find(option => String(option) === event.target.value); update(field.name, selected); }}>
                    {!field.required && <option value="">Automático</option>}{field.options?.map(option => <option key={option} value={String(option)}>{option}</option>)}
                </select>
                : field.kind === "textarea" ? <textarea id={id} value={String(data ?? "")} onChange={event => update(field.name, event.target.value)} />
                : field.kind === "image-url" ? <ImageField id={id} value={String(data ?? "")} onChange={next => update(field.name, next)} />
                 : <input id={id} type={field.kind === "number" ? "number" : "text"} step={field.kind === "number" ? "any" : undefined} min={field.min} max={field.max} value={String(data ?? "")} onChange={event => update(field.name, field.kind === "number" ? event.target.value === "" ? undefined : Number(event.target.value) : event.target.value)} />}
            {fieldErrors.length > 0 && <p className={styles.fieldError} role="alert">{fieldErrors.map(issue => issue.message).join(" ")}</p>}
        </div>;
    })}</>;
}
