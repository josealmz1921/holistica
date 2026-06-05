"use client"
import React, {
    useRef,
    useCallback,
    useState,
    useLayoutEffect,
    useEffect,
} from "react";
import { toKey } from "./selectUtils";
import defaultClasses from "./select.module.css";
import { Arrow } from "@/src/components/Icons/icons";
import Portal from "@/src/components/Portal";

import type {
    SelectBaseProps,
    SelectBaseOption,
} from "@/src/types/selectTypes";

export default function SelectBase<T, O extends SelectBaseOption<T>>(
    props: SelectBaseProps<T, O>
): React.ReactElement {
    const {
        classes: propsClasses,
        label,
        message,
        error,
        touched,
        id,
        name,
        options = [],
        placeholder,
        required,
        variant,
        open,
        highlighted,
        value,
        selectedOption,
        disabled,
        triggerRef,
        toggleOpen,
        onTriggerKeyDown,
        onListKeyDown,
        makeSelection,
        setHighlighted,
        onBlur,
    } = props;

    const classes = { ...defaultClasses, ...propsClasses };
    const hasError = Boolean(touched && error);

    const rootRef = useRef<HTMLDivElement | null>(null);

    const [popupRef, setPopupRef] = useState<HTMLDivElement | null>(null)

    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({
        position: "fixed",
        zIndex: 9999,
    });

    useLayoutEffect(() => {
        if (!open || !triggerRef?.current || !popupRef) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popupRect = popupRef.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        const openUpwards =
            spaceBelow < popupRect.height && spaceAbove > popupRect.height;

        setPopupStyle({
            position: "fixed",
            left: triggerRect.left,
            width: triggerRect.width,
            zIndex: 9999,
            top: openUpwards
                ? triggerRect.top - popupRect.height
                : triggerRect.bottom,
        });
    }, [open, triggerRef, popupRef]);

    const updatePosition = useCallback(() => {
        if (!open || !triggerRef?.current || !popupRef) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popupRect = popupRef.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        const openUpwards =
            spaceBelow < popupRect.height && spaceAbove > popupRect.height;

        setPopupStyle({
            position: "fixed",
            left: triggerRect.left,
            width: triggerRect.width,
            zIndex: 9999,
            top: openUpwards
                ? triggerRect.top - popupRect.height
                : triggerRect.bottom,
        });
    }, [open, triggerRef, popupRef]);

    useLayoutEffect(() => {
        updatePosition();
    }, [updatePosition]);

    useEffect(() => {
        if (!open) return;

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                triggerRef?.current?.contains(target) ||
                popupRef?.contains(target)
            ) {
                return;
            }
            toggleOpen()
            onBlur?.(e as any);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, popupRef, triggerRef, onBlur]);

    const inputClasses = disabled ? classes.disabled : classes.input;
    const arrowClasses = disabled ? classes.arrowDisables : classes.arrow;
    const classErrorMessage = error ? classes.messageError : classes.message;

    return (
        <div ref={rootRef} className={classes.root}>
            <div className={classes.wrapper}>
                {label && (
                    <label htmlFor={id || name} className={classes?.[(variant as string)]}>
                        {label}
                        {required && <span className={classes.required}> *</span>}
                    </label>
                )}

                <div className={classes.container} data-invalid={hasError}>
                    <button
                        ref={triggerRef}
                        id={id || name}
                        type="button"
                        className={inputClasses}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        aria-controls={`${id || name}-listbox`}
                        aria-invalid={hasError}
                        onClick={toggleOpen}
                        onKeyDown={onTriggerKeyDown}
                        disabled={disabled}
                    >
                        <span
                            className={selectedOption ? classes.value : classes.placeholder}
                        >
                            {selectedOption
                                ? (selectedOption as any).label ??
                                String((selectedOption as any).value ?? "")
                                : placeholder}
                        </span>
                        <span aria-hidden className={arrowClasses}>
                            <Arrow className={classes.icon} />
                        </span>
                    </button>

                    {open && (
                        <Portal>
                            <div
                                ref={ref => setPopupRef(ref)}
                                role="listbox"
                                id={`${id || name}-listbox`}
                                tabIndex={-1}
                                className={classes.popup}
                                style={popupStyle}
                                onKeyDown={onListKeyDown}
                            >
                                {options.map((opt, i) => {
                                    const isActive = i === highlighted;
                                    const isSelected =
                                        toKey(opt.value) === toKey(value);
                                    const isDisabled = Boolean((opt as any)?.disabled);

                                    return (
                                        <div
                                            key={`${toKey(opt.value)}:${i}`}
                                            role="option"
                                            aria-selected={isSelected}
                                            aria-disabled={isDisabled}
                                            className={[
                                                classes.option,
                                                isActive && classes.optionActive,
                                                isSelected && classes.optionSelected,
                                                isDisabled && classes.optionDisabled,
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                            onMouseEnter={() =>
                                                !isDisabled && setHighlighted(i)
                                            }
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() =>
                                                !isDisabled &&
                                                makeSelection(opt as O, i, {
                                                    cause: "mouse",
                                                })
                                            }
                                        >
                                            <span className={classes.optionLabel}>
                                                {(opt as any).label ??
                                                    String((opt as any).value ?? "")}
                                            </span>
                                            {isSelected && (
                                                <span className={classes.check}>✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Portal>
                    )}
                </div>
            </div>

            {message && (
                <p className={classErrorMessage} role="alert">
                    {message}
                </p>
            )}
        </div>
    );
}
