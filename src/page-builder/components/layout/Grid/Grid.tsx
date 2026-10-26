import { CSSProperties } from 'react';
import styles from './Grid.module.css';
import type { GridProps } from './Grid.types';

function Grid({
  children,
  columns = 3,
  gap = 24,
  className = '',
  style,
}: GridProps) {
  return (
    <div
      className={`${styles.grid} ${styles[`columns-${columns}`]} ${className}`}
      style={{
        '--grid-gap': `${gap}px`,
        ...style,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}

export default Grid;
