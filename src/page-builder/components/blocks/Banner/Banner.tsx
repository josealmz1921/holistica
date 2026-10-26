import type { FC } from 'react';
import styles from './Banner.module.css';
import { type BannerProps } from './types';
import Image from 'next/image';


const Banner: FC<BannerProps> = ({
  image,
  imageAlt = '',
  title,
  description,
  children,
  imagePosition = 'right',
  parallax = false,
  height = 'medium',
  overlay = false,
  contentAlign = 'left',
}) => {
  const isBackground = imagePosition === 'background';

  const bannerClassName = [
    styles.Banner,
    styles[`Banner--${imagePosition}`],
    styles[`Banner--${height}`],
    styles[`Banner--align-${contentAlign}`],
    isBackground && parallax ? styles['Banner--parallax'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={bannerClassName}>
      {image && (isBackground ? (
        <>
          <div
            className={styles.Banner__background}
            style={{ backgroundImage: `url(${image})` }}
            role={imageAlt ? 'img' : undefined}
            aria-label={imageAlt || undefined}
          />

          {overlay && <div className={styles.Banner__overlay} />}
        </>
      ) : (
        <div className={styles.Banner__image}>
          { image && (
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
      ))}

      <div className={styles.Banner__content}>
        {title && <h2 className={styles.Banner__title}>{title}</h2>}

        {description && (
          <div className={styles.Banner__description}>
            {description}
          </div>
        )}

        {children && (
          <div className={styles.Banner__actions}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default Banner;
