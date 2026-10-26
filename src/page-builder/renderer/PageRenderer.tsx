import type { PageDocument } from '../types/page';
import { parsePageDocument } from '../schemas/page.schema';
import type { PageBuilderTheme } from '../styles/themes';
import BlockRenderer from './BlockRenderer';
import styles from '../styles/PageBuilder.module.css';
import '../styles/tokens.css';
import type { TextRenderer } from '../types/render';

export interface PageRendererProps {
  document: PageDocument;
  theme?: PageBuilderTheme;
  mode?: 'draft' | 'publish';
  className?: string;
  renderText?: (sectionId: string, ...args: Parameters<TextRenderer>) => ReturnType<TextRenderer>;
}

/** Same render tree for public pages and the admin preview. No data fetching. */
export default function PageRenderer({ document, theme, mode = 'publish', className = '', renderText }: PageRendererProps) {
  const page = parsePageDocument(document, { mode });

  return (
    <div data-page-builder="" className={`${styles.root} ${className}`} style={theme}>
      <div className={styles.inner}>
        {page.sections.map((section) => <BlockRenderer key={section.id} section={section} renderText={renderText ? (path, value) => renderText(section.id, path, value) : undefined} />)}
      </div>
    </div>
  );
}
