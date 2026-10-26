import type { BlockType, BlockVariant } from '../registry/blocks';

export interface ImageContent { src: string; alt: string }
export interface ActionContent { label: string; href: string; priority?: 'primary' | 'secondary' }
export interface CardContent {
  id: string;
  title: string;
  description: string;
  image?: ImageContent;
  link?: { text: string; href: string; target?: '_self' | '_blank' };
}
export interface ProjectContent extends CardContent {
  company: string;
  logo?: ImageContent;
  image: ImageContent;
  category: string;
}
interface SectionBase<T extends BlockType> {
  id: string;
  type: T;
  variant: BlockVariant<T>;
  visible: boolean;
  navigationLabel?: string;
  tone?: 'plain' | 'panel';
}
interface HeadingContent { eyebrow?: string; title: string; description: string }
export type PageSection =
  | (SectionBase<'hero'> & { settings?: { imageOpacity?: number; overlayOpacity?: number; parallax?: boolean; verticalAlignment?: 'top' | 'center' | 'bottom' }; content: HeadingContent & { image?: ImageContent; subtitle?: string; actions: ActionContent[] } })
  | (SectionBase<'text'> & { content: HeadingContent & { actions?: ActionContent[]; note?: string } })
  | (SectionBase<'banner'> & { settings?: { height?: 'small' | 'medium' | 'large' | 'auto'; contentAlign?: 'left' | 'center' | 'right'; parallax?: boolean; overlay?: boolean }; content: HeadingContent & { image?: ImageContent; actions?: ActionContent[] } })
  | (SectionBase<'cards'> & { columns: 1 | 2 | 3 | 4; content: HeadingContent & { items: CardContent[]; note?: string } })
  | (SectionBase<'projects'> & { columns: 1 | 2 | 3 | 4; content: HeadingContent & { items: ProjectContent[]; emptyMessage: string } });

/** Storage contract; authentication and draft/public storage belong to the host. */
export interface PageDocument {
  schemaVersion: 1;
  id: string;
  title: string;
  seo?: { title: string; description: string };
  sections: PageSection[];
}
