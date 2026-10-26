import styles from './Section.module.css';
import type { SectionProps } from './Section.types';

function Section({
  children,
  container = true,
  className = '',
  ...props
}: SectionProps) {
  return (
    <section
      className={`${styles.section} ${className}`}
      {...props}
    >
      {container ? (
        <div className={styles.container}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export default Section;
