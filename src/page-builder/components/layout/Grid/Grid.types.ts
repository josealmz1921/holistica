import type { CSSProperties, ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  className?: string;
  style?: CSSProperties;
}
