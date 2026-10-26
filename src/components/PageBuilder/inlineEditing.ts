import { getBlockFields, type EditorField, type PageSection } from '../../page-builder/editor';

export function isInlineField(field: EditorField, type: PageSection['type']) {
    return (field.kind === 'text' || field.kind === 'textarea') && !['id', 'alt'].includes(field.name) && !(type === 'banner' && field.name === 'eyebrow');
}

export function inlineTextFields(section: PageSection) {
    const result: { path: string; label: string; value: string; multiline: boolean }[] = [];
    function visit(fields: readonly EditorField[], value: Record<string, unknown>, prefix: string) {
        for (const field of fields) {
            const path = `${prefix}.${field.name}`;
            const data = value[field.name];
            if (isInlineField(field, section.type)) result.push({ path, label: field.label, value: typeof data === 'string' ? data : '', multiline: field.kind === 'textarea' });
            else if (field.kind === 'object' && data && typeof data === 'object') visit(field.fields || [], data as Record<string, unknown>, path);
            else if (field.kind === 'list' && Array.isArray(data)) data.forEach((item, index) => visit(field.fields || [], item, `${path}.${index}`));
        }
    }
    const content = getBlockFields(section.type).find(field => field.name === 'content');
    visit(content?.fields || [], section.content as unknown as Record<string, unknown>, 'content');
    return result;
}

export function updateInlineText(section: PageSection, path: string, value: string): PageSection {
    if (value.length > 10000 || !inlineTextFields(section).some(field => field.path === path)) return section;
    const next = structuredClone(section);
    const keys = path.split('.');
    let target = next as unknown as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
    target[keys[keys.length - 1]] = value;
    return next;
}
