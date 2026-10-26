import { blockRegistry, type BlockType } from './blocks';

export interface EditorField {
  name: string;
  label: string;
  kind: 'text' | 'textarea' | 'url' | 'image-url' | 'boolean' | 'select' | 'number' | 'object' | 'list';
  required?: boolean;
  options?: readonly (string | number)[];
  fields?: readonly EditorField[];
  min?: number;
  max?: number;
}

const imageFields: EditorField[] = [
  { name: 'src', label: 'Archivo o URL de imagen', kind: 'image-url', required: true },
  { name: 'alt', label: 'Texto alternativo (vacío si es decorativa)', kind: 'text', required: true },
];
const actionFields: EditorField[] = [
  { name: 'label', label: 'Texto del botón', kind: 'text', required: true },
  { name: 'href', label: 'Destino', kind: 'url', required: true },
  { name: 'priority', label: 'Estilo', kind: 'select', options: ['primary', 'secondary'] },
];
const linkFields: EditorField[] = [
  { name: 'text', label: 'Texto del enlace', kind: 'text', required: true },
  { name: 'href', label: 'Destino', kind: 'url', required: true },
  { name: 'target', label: 'Abrir enlace', kind: 'select', options: ['_self', '_blank'] },
];
const headingFields: EditorField[] = [
  { name: 'eyebrow', label: 'Antetítulo', kind: 'text' },
  { name: 'title', label: 'Título', kind: 'text', required: true },
  { name: 'description', label: 'Descripción', kind: 'textarea', required: true },
];
const itemFields: EditorField[] = [
  { name: 'id', label: 'Identificador', kind: 'text', required: true },
  { name: 'title', label: 'Título', kind: 'text', required: true },
  { name: 'description', label: 'Descripción', kind: 'textarea', required: true },
  { name: 'image', label: 'Imagen', kind: 'object', fields: imageFields },
  { name: 'link', label: 'Enlace', kind: 'object', fields: linkFields },
];
const actions: EditorField = { name: 'actions', label: 'Botones', kind: 'list', fields: actionFields, max: 8 };

const contentFields: Record<BlockType, EditorField[]> = {
  hero: [...headingFields, { name: 'subtitle', label: 'Texto de cierre', kind: 'text' }, { name: 'image', label: 'Fondo', kind: 'object', fields: imageFields }, { ...actions, required: true }],
  text: [...headingFields, actions, { name: 'note', label: 'Nota', kind: 'textarea' }],
  banner: [...headingFields, { name: 'image', label: 'Imagen', kind: 'object', fields: imageFields }, actions],
  cards: [...headingFields, { name: 'items', label: 'Tarjetas', kind: 'list', fields: itemFields, required: true, max: 100 }, { name: 'note', label: 'Nota', kind: 'textarea' }],
  projects: [...headingFields, {
    name: 'items', label: 'Proyectos', kind: 'list', required: true, max: 100,
    fields: [...itemFields.filter((field) => field.name !== 'image'),
      { name: 'image', label: 'Captura', kind: 'object', fields: imageFields, required: true },
      { name: 'company', label: 'Empresa', kind: 'text', required: true },
      { name: 'category', label: 'Categoría', kind: 'text', required: true },
      { name: 'logo', label: 'Logo', kind: 'object', fields: imageFields }],
  }, { name: 'emptyMessage', label: 'Mensaje sin proyectos', kind: 'textarea', required: true }],
};

export function getBlockFields(type: BlockType): EditorField[] {
  const fields: EditorField[] = [
    { name: 'id', label: 'Identificador y ancla', kind: 'text', required: true },
    { name: 'visible', label: 'Visible', kind: 'boolean', required: true },
    { name: 'navigationLabel', label: 'Etiqueta del menú', kind: 'text' },
    { name: 'variant', label: 'Variante', kind: 'select', required: true, options: blockRegistry[type].variants },
    { name: 'tone', label: 'Presentación', kind: 'select', options: ['plain', 'panel'] },
  ];
  if (type === 'cards' || type === 'projects') fields.push({ name: 'columns', label: 'Columnas', kind: 'select', options: [1, 2, 3, 4], required: true });
  if (type === 'hero') fields.push({ name: 'settings', label: 'Presentación de portada', kind: 'object', fields: [
    { name: 'imageOpacity', label: 'Opacidad de imagen', kind: 'number', min: 0, max: 1 },
    { name: 'overlayOpacity', label: 'Opacidad de capa', kind: 'number', min: 0, max: 1 },
    { name: 'parallax', label: 'Efecto de fondo', kind: 'boolean' },
    { name: 'verticalAlignment', label: 'Alineación vertical', kind: 'select', options: ['top', 'center', 'bottom'] },
  ] });
  if (type === 'banner') fields.push({ name: 'settings', label: 'Presentación del banner', kind: 'object', fields: [
    { name: 'height', label: 'Altura', kind: 'select', options: ['small', 'medium', 'large', 'auto'] },
    { name: 'contentAlign', label: 'Alineación', kind: 'select', options: ['left', 'center', 'right'] },
    { name: 'parallax', label: 'Fondo fijo', kind: 'boolean' },
    { name: 'overlay', label: 'Capa de contraste', kind: 'boolean' },
  ] });
  fields.push({ name: 'content', label: 'Contenido', kind: 'object', required: true, fields: contentFields[type] });
  return fields;
}
