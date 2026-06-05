import { useField } from "informed";
import styles from "./Toggle.module.css";

interface ToggleProps {
  name: string;
  label?: string;
  disabled?: boolean;
  initialValue?: boolean;
}

export const Toggle = ({
  name,
  label,
  disabled = false,
  initialValue = false,
}: ToggleProps) => {
  const { fieldState, fieldApi } = useField({
    name,
    type: "checkbox",
    initialValue,
  });

  const checked = Boolean(fieldState.value);

  const handleToggle = () => {
    if (!disabled) {
      fieldApi.setValue(!checked);
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
        disabled={disabled}
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