import type { UseSelectResult } from "@/src/interfaces/selectInterfaces";

type SelectCause = "mouse" | "kbd" | "programmatic";

type SelectMeta = {
    cause?: SelectCause;
    index?: number;
} & Record<string, unknown>;

type SelectOption<T = unknown> = Option<T> & {
    disabled?: boolean;
};

type Option<T = unknown> = {
    value: T;
    label?: unknown; // adjust to `string | React.ReactNode` if needed in your UI layer
} & Record<string, unknown>;

type SelectBaseOption<T = unknown> = SelectOption<T> & Option<T>;

type SelectBaseProps<T, O extends SelectBaseOption<T>> = SelectVisualProps &
    Pick<
        UseSelectResult<T, O>,
        | "disabled"
        | "highlighted"
        | "listRef"
        | "makeSelection"
        | "onListKeyDown"
        | "onTriggerKeyDown"
        | "open"
        | "selectedOption"
        | "setHighlighted"
        | "toggleOpen"
        | "triggerRef"
        | "value"
    > & {
        onBlur?: (e?: React.FocusEvent | null) => void;
        options: readonly O[];
    };

type SelectVisualProps = {
    classes?: Record<string, string>;
    id?: string;
    error?: string;
    label?: React.ReactNode;
    name?: string;
    message?: React.ReactNode;
    placeholder?: string;
    text?: React.ReactNode;
    touched?: boolean;
    required?: boolean;
    variant?: 'outlined' | 'standard';
};

export type {
    SelectBaseProps,
    SelectVisualProps,
    SelectCause,
    SelectMeta,
    SelectOption,
    Option,
    SelectBaseOption,
}