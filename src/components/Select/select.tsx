"use client"
import { useMemo, useEffect, useCallback, useRef } from "react";
import { useField, useFormState, type FieldProps } from "informed";
import SelectBase from "./selectBase"; // if SelectBase doesn't export its props, remove this import
import { useSelect } from "./useSelect";
import type { SelectBaseProps, SelectOption, SelectMeta } from "@/src/types/selectTypes";

type OptionsProp<T> = readonly SelectOption<T>[] | ((values: any) => readonly SelectOption<T>[]);

type FallbackKind = "first" | "last" | "none";
type FallbackResolver<T, O extends SelectOption<T>> = (opts: readonly O[], prev: T | undefined) => T | undefined;

/** Visual-only props (forwarded to SelectBase) */
type VisualProps = {
    classes?: Record<string, string>;
    id?: string;
    label?: React.ReactNode;
    text?: React.ReactNode;
    message?: React.ReactNode;
    placeholder?: string;
};

/** Public props for the informed-aware Select (generic over value T and option O). */
export type SelectInformedProps<T, O extends SelectOption<T> = SelectOption<T>> = VisualProps & {
    /** Informed field name (required) */
    name: string;

    required?: boolean;

    /** Options list */
    options?: OptionsProp<T>;

    /** Disable interactions */
    disabled?: boolean;

    /** Informed validation props (sync or async functions; one or array) */
    validate?: (value: unknown, values: Record<string, unknown>) => unknown;

    validateOn?: "change" | "blur" | "submit";

    /** What to do when the current value no longer exists in the new options */
    fallbackOnMissing?: FallbackKind | FallbackResolver<T, O>;

    variant?: 'outlined' | 'standard';

    /** Hook callbacks (optional) */
    onChange?: (nextValue: T, option: O, meta: SelectMeta) => void;
    onBlur?: (e?: React.FocusEvent | null) => void;
    onOpenChange?: (open: boolean) => void;
    onHighlightChange?: (index: number, option: O | undefined) => void;
    onOptionClick?: (option: O, index: number, meta: SelectMeta) => void;
    onValueChange?: (nextValue: T, option: O, meta: SelectMeta) => void;
};

/**
 * Informed-aware Select:
 * - Registers with Informed via `useField(name)`.
 * - Uses `useSelect` for UI behavior (open, highlight, keyboard, etc.).
 * - Renders `SelectBase` as the presentational component.
 */
export default function SelectInformed<T, O extends SelectOption<T> = SelectOption<T>>(props: SelectInformedProps<T, O>): React.ReactElement {
    const {
        classes: propsClasses,
        disabled,
        fallbackOnMissing = "none",
        id,
        label,
        message,
        name,
        onBlur,
        onChange,
        onHighlightChange,
        onOpenChange,
        onOptionClick,
        options = [],
        onValueChange,
        placeholder,
        text,
        validate,
        validateOn = "change",
        required,
        variant = 'standard'
    } = props;

    const classes = { ...propsClasses };

    // Correct registration with Informed (v3 uses `name`)
    // You can also use `useField({ name, type: "select" })` if you want type tagging
    const { fieldApi, fieldState } = useField({ name, type: "select", validate, validateOn });
    const { error, touched, value: fieldValue } = fieldState;

    const didMountRef = useRef(false);

    // We obtain all the values from the form
    const formState = useFormState();

    // We resolve the options (array or dynamic function)
    const valuesKey = JSON.stringify(formState.values);
    const resolvedOptions = useMemo(() => {
        return typeof options === "function" ? options(formState.values) : options;
    }, [options, valuesKey]);

    // Bridge: when UI value changes, persist to Informed and bubble up (optional)
    const handleValueChange = useCallback(
        (nextValue: T, option: O, meta: SelectMeta) => {
            fieldApi.setValue(nextValue as any);
            if (validateOn === "change") fieldApi.setTouched(true);
            onValueChange?.(nextValue, option, meta);
            onChange?.(nextValue, option, meta);
        },
        [fieldApi, onValueChange, onChange, validateOn]
    );

    const handleBlur = useCallback(
        (e?: React.FocusEvent | null) => {
            fieldApi.setTouched(true);
            if (validateOn === "blur") {
                fieldApi.validate();
            }
            onBlur?.(e ?? null);
        },
        [fieldApi, onBlur, validateOn]
    );

    // Hook for UI behavior (controlled by `fieldValue`)
    const hook = useSelect<T, O>({
        value: fieldValue as T | undefined,
        options: resolvedOptions as readonly O[],
        disabled,
        onValueChange: handleValueChange,
        onWidgetBlur: handleBlur,
        onOpenChange,
        onHighlightChange,
        onOptionClick,
        placeholder,
        id: id || name,
    });

    const normalizedError: string | undefined = typeof error === "string" ? error : error == null ? undefined : String(error);

    useEffect(() => {
        if (!didMountRef.current) {
            // skip the first render (assembly)
            didMountRef.current = true;
            return;
        }

        const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
        if (!hasValue) return; // do not apply fallback if there is no current value

        const exists = resolvedOptions.some((o) => o.value === fieldValue);
        if (exists) return;

        // choose fallback
        let next: T | undefined;
        if (typeof fallbackOnMissing === "function") {
            next = fallbackOnMissing(resolvedOptions as readonly O[], fieldValue as T | undefined);
        } else if (fallbackOnMissing === "first") {
            next = resolvedOptions[0]?.value as T | undefined;
        } else if (fallbackOnMissing === "last") {
            next = resolvedOptions[resolvedOptions.length - 1]?.value as T | undefined;
        } else {
            next = undefined; // "none"
        }

        fieldApi.setValue(next as any);

        // Only mark as touched if it was ALREADY touched (avoids showing an error when mounting)
        if (touched) fieldApi.setTouched(true);
    }, [resolvedOptions, fieldValue, fallbackOnMissing, fieldApi, touched]);

    // Memoize props passed to the presentational component to avoid unnecessary re-renders
    // If SelectBase exports its prop type, you can specify it here:
    const baseProps = useMemo<SelectBaseProps<T, O>>(
        () => ({
            classes,
            label,
            text,
            message: normalizedError ?? message,
            error: normalizedError,
            touched,
            id: id || name,
            name,
            required,
            variant,
            options: resolvedOptions as readonly O[],
            onBlur: handleBlur,
            ...hook,
        }),
        [classes, label, text, message, error, touched, id, name, resolvedOptions, handleBlur, hook, options]
    );
    return <SelectBase<T, O> {...baseProps} />;
}