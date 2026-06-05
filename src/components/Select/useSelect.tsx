import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findOptionByValue, isEqualVal} from "./selectUtils";

import type {SelectOption, SelectMeta} from "@utilities/types/selectTypes";

interface UseSelectProps<T, O extends SelectOption<T> = SelectOption<T>> {
    /** Controlled value */
    value?: T;
    /** Uncontrolled initial value */
    defaultValue?: T | null;
    /** Fired when value changes */
    onValueChange?: (nextValue: T, option: O, meta: SelectMeta) => void;
    /** Options list */
    options?: readonly O[];
    /** Disable interactions */
    disabled?: boolean;
    /** Fired when popup opens/closes */
    onOpenChange?: (open: boolean) => void;
    /** Fired when highlighted index changes */
    onHighlightChange?: (index: number, option: O | undefined) => void;
    /** Fired when an option is clicked/confirmed */
    onOptionClick?: (option: O, index: number, meta: SelectMeta) => void;
    /** New: full widget blur notification */
    onWidgetBlur?: (e?: React.FocusEvent | null) => void;
    /** UI helpers */
    placeholder?: string;
    id?: string;
    error?: string;
    touched?: boolean
}

interface UseSelectResult<T, O extends SelectOption<T> = SelectOption<T>> {
    // state
    open: boolean;
    highlighted: number;
    value: T | null | undefined;
    selectedOption: O | null;
    disabled: boolean;

    // refs
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    listRef: React.RefObject<HTMLDivElement | null>;

    // actions
    toggleOpen: () => void;
    openList: () => void;
    closeList: () => void;
    makeSelection: (opt: O, index: number, meta?: SelectMeta) => void;
    setHighlighted: React.Dispatch<React.SetStateAction<number>>;

    // handlers
    onTriggerKeyDown: (e: React.KeyboardEvent) => void;
    onListKeyDown: (e: React.KeyboardEvent) => void;

    // passthrough props
    placeholder: string;
    id?: string;
}

export function useSelect<T, O extends SelectOption<T> = SelectOption<T>>(props: UseSelectProps<T, O>): UseSelectResult<T, O> {
    const {
        value, // controlled
        defaultValue = null, // uncontrolled
        onValueChange,
        options = [],
        disabled = false,
        onOpenChange,
        onHighlightChange,
        onOptionClick,
        onWidgetBlur,
        placeholder = "Selecciona una opción",
        id,
    } = props;

    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState<T | null>(defaultValue);
    const currentValue = (isControlled ? value : innerValue) as T | null | undefined;

    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo<O | null>(() => findOptionByValue<T, O>(options, currentValue as T) ?? null, [options, currentValue]);

    const openList = useCallback(() => {
        if (!disabled) setOpen(true);
    }, [disabled]);

    const closeList = useCallback(() => {
        setOpen(false);
        setHighlighted(-1);
    }, []);

    const _notifyBlur = useCallback(
        (e?: React.FocusEvent | null) => {
            onWidgetBlur?.(e ?? null);
        },
        [onWidgetBlur]
    );

    const toggleOpen = useCallback(() => {
        if (!disabled) setOpen((p) => !p);
    }, [disabled]);

    const setValue = useCallback(
        (nextVal: T, option: O, meta: SelectMeta = {}) => {
            if (!isControlled) setInnerValue(nextVal);
            onValueChange?.(nextVal, option, meta);
        },
        [isControlled, onValueChange]
    );

    const makeSelection = useCallback(
        (opt: O, index: number, meta: SelectMeta = {}) => {
            if (!opt || opt.disabled) return;
            setValue(opt.value as T, opt, { index, ...meta });
            closeList();
            triggerRef.current?.focus();
            onOptionClick?.(opt, index, meta);
        },
        [setValue, closeList, onOptionClick]
    );

    // notify open/close
    useEffect(() => {
        onOpenChange?.(open);
    }, [open, onOpenChange]);

    // outside click + Escape
    useEffect(() => {
        if (!open) return;

        const onDocClick = (e: MouseEvent) => {
            const t = triggerRef.current;
            const l = listRef.current;
            const target = e.target as Node | null;
            if (!t || !l || !target) return;
            const clickedOutside = !t.contains(target) && !l.contains(target);
            if (clickedOutside) {
                closeList();
                setTimeout(() => {
                    const active = document.activeElement;
                    if (active !== t && (!l || (active && !l.contains(active)))) {
                        _notifyBlur(null);
                    }
                }, 0);
            }
        };

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                closeList();
                triggerRef.current?.focus(); // foco vuelve al trigger (no es blur todavía)
            }
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open, closeList, _notifyBlur]);

    const focusFirstEnabled = useCallback((): number => {
        const idx = options.findIndex((o) => !o?.disabled);
        setHighlighted(idx);
        onHighlightChange?.(idx, options[idx]);
        return idx;
    }, [options, onHighlightChange]);

    const focusLastEnabled = useCallback((): number => {
        for (let i = options.length - 1; i >= 0; i--) {
            if (!options[i]?.disabled) {
                setHighlighted(i);
                onHighlightChange?.(i, options[i]);
                return i;
            }
        }
        return -1;
    }, [options, onHighlightChange]);

    const scrollIntoView = useCallback((index: number) => {
        const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, []);

    const onTriggerKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;
            switch (e.key) {
                case "ArrowDown":
                case "Enter":
                case " ": {
                    e.preventDefault();
                    if (!open) {
                        openList();
                        const selectedIdx = options.findIndex((o) => isEqualVal(o?.value as T, currentValue as T) && !o?.disabled);
                        const idx = selectedIdx >= 0 ? selectedIdx : focusFirstEnabled();
                        setHighlighted(idx);
                    }
                    break;
                }
                case "ArrowUp": {
                    e.preventDefault();
                    if (!open) {
                        openList();
                        const idx = focusLastEnabled();
                        setHighlighted(idx);
                    }
                    break;
                }
                default:
                    break;
            }
        },
        [disabled, open, openList, options, currentValue, focusFirstEnabled, focusLastEnabled]
    );

    const onListKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!open) return;
            switch (e.key) {
                case "ArrowDown": {
                    e.preventDefault();
                    if (!options.length) return;
                    let i = highlighted;
                    do {
                        i = (i + 1) % options.length;
                    } while (options[i]?.disabled && i !== highlighted);
                    setHighlighted(i);
                    onHighlightChange?.(i, options[i]);
                    scrollIntoView(i);
                    break;
                }
                case "ArrowUp": {
                    e.preventDefault();
                    if (!options.length) return;
                    let i = highlighted;
                    do {
                        i = (i - 1 + options.length) % options.length;
                    } while (options[i]?.disabled && i !== highlighted);
                    setHighlighted(i);
                    onHighlightChange?.(i, options[i]);
                    scrollIntoView(i);
                    break;
                }
                case "Home": {
                    e.preventDefault();
                    const i = focusFirstEnabled();
                    scrollIntoView(i);
                    break;
                }
                case "End": {
                    e.preventDefault();
                    const i = focusLastEnabled();
                    scrollIntoView(i);
                    break;
                }
                case "Enter":
                case " ": {
                    e.preventDefault();
                    if (highlighted >= 0 && !options[highlighted]?.disabled) {
                        makeSelection(options[highlighted] as O, highlighted, { cause: "kbd" });
                    }
                    break;
                }
                case "Escape": {
                    e.preventDefault();
                    closeList();
                    triggerRef.current?.focus();
                    break;
                }
                default:
                    break;
            }
        },
        [open, options, highlighted, scrollIntoView, focusFirstEnabled, focusLastEnabled, makeSelection, closeList, onHighlightChange]
    );

    return {
        // States
        open,
        highlighted,
        value: currentValue,
        selectedOption,
        disabled,
        // Ref
        triggerRef,
        listRef,
        // Handles
        toggleOpen,
        openList,
        closeList,
        makeSelection,
        setHighlighted,
        // Trigger
        onTriggerKeyDown,
        onListKeyDown,
        // Passthrough props
        placeholder,
        id,
        ...props,
    };
}