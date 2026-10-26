import React from "react";
import styles from "./TextBlock.module.css";
import type { TextRenderer } from '../../../types/render';

export type TextAlign = "left" | "center" | "right";

export interface TextBlockProps {
  renderText?: TextRenderer;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;

  align?: TextAlign;

  className?: string;
}

const TextBlock = ({
  eyebrow,
  title,
  subtitle,
  description,
  align = "left",
  className = "",
  renderText,
}: TextBlockProps) => {
  return (
    <div
      className={`${styles.textBlock} ${styles[align]} ${className}`}
    >
      {(eyebrow || renderText) && (
        <span className={styles.eyebrow}>
          {renderText ? renderText('eyebrow', eyebrow ?? '') : eyebrow}
        </span>
      )}

      {(title || renderText) && (
        <h2 className={styles.title}>
          {renderText ? renderText('title', title ?? '') : title}
        </h2>
      )}

      {subtitle && (
            <p className={styles.subtitle}>
          {subtitle}
            </p>
      )}

      {(description || renderText) && (
        <p className={styles.description}>
          {renderText ? renderText('description', description ?? '') : description}
        </p>
      )}
    </div>
  );
};

export default TextBlock;
