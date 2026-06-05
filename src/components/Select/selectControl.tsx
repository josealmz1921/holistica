"use client"
import React, { useCallback } from "react";
import { useSelect } from "./useSelect";
import type { SelectOption, SelectMeta } from "@/src/types/selectTypes";
import type { UseSelectResult } from "@/src/interfaces/selectInterfaces";
import SelectBase from "./selectBase";
import defaultClasses from "./select.module.css";

// Visual props for the wrapper/base component
type VisualProps = {
    classes?: Record<string, string>;
    id?: string;
    name?: string;
    label?: React.ReactNode;
    text?: React.ReactNode;
    message?: React.ReactNode;
    placeholder?: string;
};

// Public props for SelectControl (generic over value type T and option type O)
export type SelectControlProps<T, O extends SelectOption<T> = SelectOption<T>> = VisualProps & {
    options?: readonly O[];
    value?: T; // controlled
    error?: string;
    touched?: boolean;
    defaultValue?: T | null; // uncontrolled
    onValueChange?: (nextValue: T, option: O, meta: SelectMeta) => void;
    onChange?: (nextValue: T, option: O, meta: SelectMeta) => void;
    onBlur?: (e?: React.FocusEvent | null) => void;
    disabled?: boolean;
};

// Minimal typing for SelectBase (merge visual props + hook result + options)
type SelectBaseProps<T, O extends SelectOption<T> = SelectOption<T>> = VisualProps &
    UseSelectResult<T, O> & {
        options: readonly O[];
        error?: string;
        touched?: boolean;
        name?: string;
        onBlur?: (e?: React.FocusEvent | null) => void;
    };

// If SelectBase already has its own .d.ts, you can remove this cast
const TypedSelectBase = SelectBase as unknown as <T, O extends SelectOption<T>>(props: SelectBaseProps<T, O>) => React.ReactElement;

export default function SelectControl<T, O extends SelectOption<T> = SelectOption<T>>(props: SelectControlProps<T, O>) {
    const {
        classes: propsClasses,
        options = [],
        value,
        defaultValue = null,
        onValueChange,
        onChange,
        onBlur,
        placeholder = "Selecciona una opción",
        disabled,
        id,
        name,
        label,
        text,
        message,
        error,
        touched,
    } = props;

    const classes = { ...defaultClasses, ...propsClasses };

    const handleValueChange = useCallback(
        (nextValue: T, option: O, meta: SelectMeta) => {
            onValueChange?.(nextValue, option, meta);
            onChange?.(nextValue, option, meta);
        },
        [onValueChange, onChange]
    );

    const hook = useSelect<T, O>({
        value,
        defaultValue,
        options,
        disabled,
        onValueChange: handleValueChange,
        onWidgetBlur: onBlur,
        placeholder,
        id: id || name,
        error,
        touched,
    });

    return (
        <TypedSelectBase<T, O>
            classes={classes}
            label={label}
            text={text}
            message={message}
            id={id || name}
            name={name}
            options={options}
            error={error}
            touched={touched}
            onBlur={onBlur}
            {...hook}
        />
    );
}