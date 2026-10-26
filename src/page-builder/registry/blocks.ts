/** Shared catalog for rendering and the future admin's selectors. */
export const blockRegistry = {
  hero: { label: 'Portada', variants: ['left', 'center', 'right'] },
  text: { label: 'Texto', variants: ['left', 'center', 'right'] },
  banner: { label: 'Banner', variants: ['left', 'right', 'top', 'bottom', 'background'] },
  cards: { label: 'Tarjetas', variants: ['default', 'image-top', 'image-left', 'image-right', 'featured', 'compact'] },
  projects: { label: 'Proyectos', variants: ['image-top', 'image-left', 'image-right'] },
} as const;

export type BlockType = keyof typeof blockRegistry;
export type BlockVariant<T extends BlockType> = typeof blockRegistry[T]['variants'][number];
