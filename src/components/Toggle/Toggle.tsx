import { useRef, useState } from "react";
import { useField } from "informed";
import styles from "./Toggle.module.css";

interface ToggleProps {
  name: string;
  label?: string;
  disabled?: boolean;
  initialValue?: boolean;
  onChange?: (checked: boolean) => Promise<boolean>;
  ariaLabel?: string;
}

export const Toggle = ({
  name,
  label,
  disabled = false,
  initialValue = false,
  onChange,
  ariaLabel,
}: ToggleProps) => {
  const { fieldState, fieldApi } = useField({
    name,
    type: "checkbox",
    initialValue,
  });

  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const checked = Boolean(fieldState.value);

  const handleToggle = async () => {
    if (disabled || pending.current) return;

    const nextValue = !checked;
    if (!onChange) {
      fieldApi.setValue(nextValue);
      return;
    }

    pending.current = true;
    setSaving(true);
    try {
      if (await onChange(nextValue)) {
        fieldApi.setValue(nextValue);
      }
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      <button
        id={name}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || name}
        aria-busy={saving}
        disabled={disabled || saving}
        onClick={handleToggle}
        className={`${styles.toggle} ${
          checked ? styles.active : ""
        }`}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
};