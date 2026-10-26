import type { CSSProperties } from 'react';

export type PageBuilderTheme = CSSProperties & Partial<Record<`--pb-${string}`, string>>;

/** Values read from holistica/app/globals.css; no fonts are downloaded here. */
export const florDeLunaTheme: PageBuilderTheme = {
  '--pb-background': 'var(--color-secondary, #f5f2ed)',
  '--pb-surface': '#fffdf9',
  '--pb-panel': '#ece8e0',
  '--pb-text': 'var(--color-tertiary, #2d3a30)',
  '--pb-muted': 'var(--color-neutral, #706d67)',
  '--pb-primary': 'var(--color-tertiary, #2d3a30)',
  '--pb-on-primary': '#fffdf9',
  '--pb-accent': 'var(--color-tertiary, #2d3a30)',
  '--pb-border': '#c9d0c7',
  '--pb-font-heading': 'var(--font-heading, "EB Garamond", serif)',
  '--pb-font-body': 'var(--font-body, "Manrope", sans-serif)',
  '--pb-hero-overlay': 'linear-gradient(90deg, #f5f2ed, rgb(245 242 237 / .6))',
};
