import Banner from '../components/blocks/Banner/Banner';
import Button from '../components/ui/Button/Button';
import Card from '../components/ui/Card/Card';
import Grid from '../components/layout/Grid/Grid';
import Hero from '../components/blocks/Hero/Hero';
import Section from '../components/layout/Section/Section';
import TextBlock from '../components/ui/TextBlock/TextBlock';
import type { ActionContent, PageSection } from '../types/page';
import styles from '../styles/Sections.module.css';
import type { TextRenderer } from '../types/render';

function Actions({ actions, renderText }: { actions?: ActionContent[]; renderText?: TextRenderer }) {
  if (!actions?.length) return null;

  return (
    <div className={styles.actions}>
      {actions.map((action, index) => (
        <Button
          key={index}
          type="button"
          href={action.href}
          priority={action.priority}
        >
          {renderText ? renderText(`actions.${index}.label`, action.label) : action.label}
        </Button>
      ))}
    </div>
  );
}

export default function BlockRenderer({ section, renderText }: { section: PageSection; renderText?: TextRenderer }) {
  if (!section.visible) return null;
  const text: TextRenderer = (path, value) => renderText ? renderText(`content.${path}`, value) : value;

  if (section.type === 'hero') {
    const { content } = section;

    return (
      <div id={section.id} className={`${styles.anchor} ${section.tone === 'panel' ? styles.panel : ''}`}>
        <Hero
          renderText={renderText ? text : undefined}
          title={content.title}
          eyebrow={content.eyebrow}
          description={content.description}
          subtitle={content.subtitle}
          image={content.image?.src}
          imageAlt={content.image?.alt}
          alignment={section.variant}
          parallax={section.settings?.parallax ?? false}
          imageOpacity={section.settings?.imageOpacity ?? 0.3}
          overlayOpacity={section.settings?.overlayOpacity ?? 0.9}
          verticalAlignment={section.settings?.verticalAlignment}
          actions={content.actions}
        />
      </div>
    );
  }

  if (section.type === 'banner') {
    const { content } = section;

    return (
      <div id={section.id} className={`${styles.section} ${styles.anchor} ${section.tone === 'panel' ? styles.panel : ''}`}>
        <Banner
          imagePosition={section.variant}
          image={content.image?.src}
          imageAlt={content.image?.alt}
          title={text('title', content.title)}
          description={text('description', content.description)}
          height={section.settings?.height}
          contentAlign={section.settings?.contentAlign}
          parallax={section.settings?.parallax}
          overlay={section.settings?.overlay}
        >
          <Actions actions={content.actions} renderText={renderText ? text : undefined} />
        </Banner>
      </div>
    );
  }

  return (
    <Section
      id={section.id}
      container={false}
      aria-label={section.content.title}
      className={`${styles.section} ${styles.anchor} ${section.tone === 'panel' ? styles.panel : ''}`}
    >
      <TextBlock
        renderText={renderText ? text : undefined}
        eyebrow={section.content.eyebrow}
        title={section.content.title}
        description={section.content.description}
        align={section.type === 'text' ? section.variant : 'left'}
        className={`${styles.heading} ${section.type === 'text' ? styles[`heading-${section.variant}`] : ''}`}
      />

      {section.type === 'text' && (
        <>
          <Actions actions={section.content.actions} renderText={renderText ? text : undefined} />
          {(section.content.note || renderText) && <p className={styles.note}>{text('note', section.content.note ?? '')}</p>}
        </>
      )}

      {section.type === 'cards' && (
        <>
          <Grid columns={section.columns} gap={24}>
            {section.content.items.map((item, index) => (
              <Card
                key={item.id}
                renderText={renderText ? (path, value) => path === 'category' ? value : text(`items.${index}.${path}`, value) : undefined}
                variant={section.variant}
                title={item.title}
                description={item.description}
                image={item.image?.src}
                imageAlt={item.image?.alt}
                link={item.link}
                className={styles.card}
                eyebrow={String(index + 1).padStart(2, '0')}
              />
            ))}
          </Grid>
          {(section.content.note || renderText) && <p className={styles.note}>{text('note', section.content.note ?? '')}</p>}
        </>
      )}

      {section.type === 'projects' && (
        section.content.items.length ? (
          <Grid columns={section.columns} gap={28}>
            {section.content.items.map((project, index) => (
              <Card
                key={project.id}
                renderText={renderText ? (path, value) => text(`items.${index}.${path}`, value) : undefined}
                variant={section.variant}
                title={project.title}
                description={project.description}
                image={project.image.src}
                imageAlt={project.image.alt}
                link={project.link}
                company={project.company}
                logo={project.logo?.src}
                logoAlt={project.logo?.alt}
                eyebrow={project.category}
                className={styles.card}
              />
            ))}
          </Grid>
        ) : (
          <div className={styles.emptyProjects}>
            <span className={styles.emptyIcon} aria-hidden="true">↗</span>
            <p>{text('emptyMessage', section.content.emptyMessage)}</p>
          </div>
        )
      )}
    </Section>
  );
}
