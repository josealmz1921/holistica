import type { FC } from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  children?: React.ReactNode;
  classes?: {[key: string]: string};
  type: 'button' | 'submit' | 'reset';
  priority?: 'primary' | 'secondary' | 'tertiary';
  href?: string;
}

const Button: FC<ButtonProps> = ({ children, classes, type, priority, href }) => {
  const className = `${styles[priority || 'primary']} ${classes?.button ?? ''}`;

  return href ? (
    <a href={href} className={className}>{children}</a>
  ) : (
    <button type={type} className={className}>{children}</button>
  );
};

export default Button;
