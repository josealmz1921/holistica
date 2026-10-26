import type { TextRenderer } from '../../../types/render';

export interface HeroAction {
  label: string;
  href?: string;
  priority?: 'primary' | 'secondary';
  showIcon?: boolean;
}

export interface HeroProps {
  renderText?: TextRenderer;
  eyebrow?: string;
  title?: string;
  description?: string;
  subtitle?: string;

  image?: string;
  imageAlt?: string;

  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'center' | 'bottom';

  parallax?: boolean;

  imageOpacity?: number;

  overlay?: boolean;
  overlayOpacity?: number;

  actions?: HeroAction[];
}
