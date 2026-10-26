import { blockRegistry, type BlockType } from '../registry/blocks';
import { getBlockFields, type EditorField } from '../registry/fields';
import type { PageDocument } from '../types/page';

export interface ValidationIssue { path: string; message: string }
export interface ValidationOptions { mode?: 'draft' | 'publish' }
export type PageValidationResult =
  | { success: true; data: PageDocument }
  | { success: false; issues: ValidationIssue[] };

/** Only plain text and safe navigation/media URLs are accepted; never HTML or code. */
export function isSafeUrl(value: string, image = false): boolean {
  if (!value || value.length > 2048 || /[\s\\<>\u0000-\u001f\u007f]|%0[ad]|%5c/i.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (!image && (/^#[a-zA-Z][\w-]*$/.test(value) || /^mailto:[^@]+@[^@]+$/.test(value) || /^tel:\+?[\d()-]+$/.test(value))) return true;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Validates and returns a clean JSON-compatible copy, omitting undefined fields. */
export function validatePageDocument(input: unknown, options: ValidationOptions = {}): PageValidationResult {
  const issues: ValidationIssue[] = [];
  const publishing = options.mode !== 'draft';
  const issue = (path: string, message: string) => { if (issues.length < 100) issues.push({ path, message }); };

  function object(value: unknown, fields: readonly EditorField[], path: string, extra: string[] = []): Record<string, unknown> {
    if (!isObject(value)) { issue(path, 'Se esperaba un objeto.'); return {}; }
    const allowed = new Set([...fields.map((field) => field.name), ...extra]);
    for (const key of Object.keys(value)) if (!allowed.has(key)) issue(`${path}.${key}`, 'Campo no permitido.');
    const output: Record<string, unknown> = {};
    for (const field of fields) {
      const data = value[field.name];
      const fieldPath = `${path}.${field.name}`;
      if (data === undefined) {
        if (field.required) issue(fieldPath, 'Campo requerido.');
        continue;
      }
      if (field.kind === 'object') {
        output[field.name] = object(data, field.fields ?? [], fieldPath);
      } else if (field.kind === 'list') {
        if (!Array.isArray(data) || data.length > (field.max ?? 100)) { issue(fieldPath, 'Lista no válida o demasiado larga.'); continue; }
        output[field.name] = data.map((item, index) => object(item, field.fields ?? [], `${fieldPath}[${index}]`));
        const ids = new Set<string>();
        for (const item of data) {
          if (isObject(item) && typeof item.id === 'string') {
            if (ids.has(item.id)) issue(fieldPath, 'Identificadores de elementos duplicados.');
            ids.add(item.id);
          }
        }
      } else if (field.kind === 'boolean') {
        if (typeof data !== 'boolean') issue(fieldPath, 'Se esperaba un booleano.');
        else output[field.name] = data;
      } else if (field.kind === 'number') {
        if (typeof data !== 'number' || !Number.isFinite(data) || data < (field.min ?? -Infinity) || data > (field.max ?? Infinity)) issue(fieldPath, 'Número fuera del rango permitido.');
        else output[field.name] = data;
      } else if (field.kind === 'select') {
        if (!(field.options ?? []).includes(data as string | number)) issue(fieldPath, 'Opción no permitida.');
        else output[field.name] = data;
      } else {
        if (typeof data !== 'string' || data.length > (field.max ?? 10000)) { issue(fieldPath, 'Texto no válido o demasiado largo.'); continue; }
        if (publishing && field.required && field.name !== 'alt' && !data.trim()) issue(fieldPath, 'No puede estar vacío al publicar.');
        if (field.name === 'id' && !/^[a-zA-Z][\w-]{0,79}$/.test(data)) issue(fieldPath, 'Usa un identificador de hasta 80 caracteres, sin espacios.');
        if ((field.kind === 'url' || field.kind === 'image-url') && !isSafeUrl(data, field.kind === 'image-url')) issue(fieldPath, 'URL no permitida.');
        output[field.name] = data;
      }
    }
    return output;
  }

  if (!isObject(input)) return { success: false, issues: [{ path: 'page', message: 'Se esperaba un documento de página.' }] };
  const allowed = new Set(['schemaVersion', 'id', 'title', 'seo', 'sections']);
  for (const key of Object.keys(input)) if (!allowed.has(key)) issue(`page.${key}`, 'Campo no permitido.');
  if (input.schemaVersion !== 1) issue('page.schemaVersion', 'Versión de documento no soportada.');
  const page = object(input, [
    { name: 'id', label: '', kind: 'text', required: true },
    { name: 'title', label: '', kind: 'text', required: true, max: 200 },
    { name: 'seo', label: '', kind: 'object', fields: [
      { name: 'title', label: '', kind: 'text', required: true, max: 200 },
      { name: 'description', label: '', kind: 'text', required: true, max: 500 },
    ] },
  ], 'page', ['schemaVersion', 'sections']);

  const sections: Record<string, unknown>[] = [];
  const ids = new Set<string>();
  if (!Array.isArray(input.sections) || input.sections.length > 100) {
    issue('page.sections', 'Se permiten hasta 100 bloques.');
  } else {
    for (const [index, section] of input.sections.entries()) {
      const path = `page.sections[${index}]`;
      if (!isObject(section) || typeof section.type !== 'string' || !Object.prototype.hasOwnProperty.call(blockRegistry, section.type)) { issue(path, 'Tipo de bloque no permitido.'); continue; }
      const parsed = object(section, getBlockFields(section.type as BlockType), path, ['type']);
      parsed.type = section.type;
      if (typeof parsed.id === 'string') {
        if (ids.has(parsed.id)) issue(`${path}.id`, 'Identificador de bloque duplicado.');
        if (parsed.id === 'contenido') issue(`${path}.id`, 'Ancla reservada para el contenido principal.');
        ids.add(parsed.id);
      }
      sections.push(parsed);
    }
  }
  const visible = sections.filter((section) => section.visible);
  const heroes = visible.filter((section) => section.type === 'hero');
  if (heroes.length > 1 || (publishing && heroes.length !== 1)) issue('page.sections', 'La página publicada debe tener una única portada H1.');
  if (heroes.length && visible[0]?.type !== 'hero') issue('page.sections', 'La portada debe ser el primer bloque visible.');
  if (issues.length) return { success: false, issues };
  return { success: true, data: { ...page, schemaVersion: 1, sections } as unknown as PageDocument };
}

export function parsePageDocument(input: unknown, options?: ValidationOptions): PageDocument {
  const result = validatePageDocument(input, options);
  if (!result.success) throw new Error(`Página no válida: ${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
  return result.data;
}
