/* Styles */
'use client'
import classes from "./input.module.css";

/* Utilities */
import { Input as InputInformed } from "informed";
import type { InputProps } from "./types";
import Message from "../Message";

type Variant = "top" | "left";

interface Props extends InputProps {
  variant?: Variant;
  formatter?: (value: string) => (string | RegExp)[],
  parse?: (value: string) => (string | RegExp),
}

function Input({
  identifier,
  label,
  required,
  type = "text",
  placeholder,
  className,
  validate,
  disabled,
  after,
  before,
  formatter,
  variant = "top",
  parse
}: Props) {
  const requiredClass = required && classes.required;

  return (
    <div
      className={`${classes.root} ${className || ""} ${variant === "left" ? classes.leftVariant : classes.topVariant
        }`}
    >
      {label && (
        <label
          className={`${classes.label} ${requiredClass}`}
          htmlFor={identifier}
        >
          {label}
        </label>
      )}

      <div className={classes.inputWrapper}>
        <div className={classes.inputContainer}>
          {before && <div className={classes.before}>{before}</div>}

          <InputInformed
            className={`${classes.input} ${before ? classes.hasBefore : ""} ${after ? classes.hasAfter : ""}`}
            parser={parse}
            formatter={formatter}
            id={identifier}
            name={identifier}
            type={type}
            placeholder={placeholder}
            validate={validate}
            showErrorIfError={false}
            showErrorIfTouched={false}
            disabled={disabled}
          />

          {after && <div className={classes.after}>{after}</div>}
        </div>
        <Message field={identifier} />
      </div>
    </div>
  );
}

export default Input;
