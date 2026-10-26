import { blockRegistry, type BlockType } from './blocks';
import type { PageSection } from '../types/page';

/** Host generates a unique stable ID; empty content is valid only as a draft. */
export function createBlock(type: BlockType, id: string): PageSection {
  if (!/^[a-zA-Z][\w-]{0,79}$/.test(id) || id === 'contenido') throw new Error('Identificador de bloque no válido.');
  const base = { id, visible: true, tone: 'plain' as const };
  const content = { title: blockRegistry[type].label, description: '' };
  switch (type) {
    case 'hero': return { ...base, type, variant: 'left', content: { ...content, actions: [] } };
    case 'text': return { ...base, type, variant: 'left', content };
    case 'banner': return { ...base, type, variant: 'right', content };
    case 'cards': return { ...base, type, variant: 'default', columns: 3, content: { ...content, items: [] } };
    case 'projects': return { ...base, type, variant: 'image-top', columns: 2, content: { ...content, items: [], emptyMessage: '' } };
  }
}
