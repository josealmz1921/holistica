import type { ReactNode } from 'react';

/** Optional host-provided text slot. Never stored in the page JSON. */
export type TextRenderer = (path: string, value: string) => ReactNode;
