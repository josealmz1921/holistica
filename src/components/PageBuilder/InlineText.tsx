"use client";

import { useEffect, useRef } from 'react';
import styles from './builder.module.css';

export default function InlineText({ value, label, multiline, disabled, onChange, onSelect }: {
    value: string; label: string; multiline: boolean; disabled: boolean; onChange: (value: string) => void; onSelect: () => void;
}) {
    const element = useRef<HTMLSpanElement>(null);
    const composing = useRef(false);
    useEffect(() => {
        if (element.current && element.current.textContent !== value && document.activeElement !== element.current) element.current.textContent = value;
    }, [value]);
    function commit() {
        if (!element.current || composing.current || disabled) return;
        const text = element.current.innerText.replace(/\r/g, '');
        const next = (multiline ? text : text.replace(/\n/g, ' ')).slice(0, 10000);
        if (next !== text) element.current.textContent = next;
        onChange(next);
    }
    function insertPlainText(text: string) {
        const selection = window.getSelection();
        if (!selection?.rangeCount || !element.current?.contains(selection.anchorNode)) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode((multiline ? text : text.replace(/[\r\n]+/g, ' ')).slice(0, 10000));
        range.insertNode(node); range.setStartAfter(node); range.collapse(true);
        selection.removeAllRanges(); selection.addRange(range);
        commit();
    }
    return <span ref={element} className={styles.inlineText} contentEditable={disabled ? false : 'plaintext-only'} suppressContentEditableWarning role="textbox" aria-label={label} aria-multiline={multiline} aria-readonly={disabled} tabIndex={disabled ? -1 : 0} data-placeholder={`Escribe ${label.toLowerCase()}…`}
        onFocus={onSelect} onInput={commit} onBlur={commit}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; commit(); }}
        onPaste={event => { event.preventDefault(); insertPlainText(event.clipboardData.getData('text/plain')); }}
        onDrop={event => event.preventDefault()}
        onKeyDown={event => { if (event.key === 'Enter' && !multiline && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.blur(); } }}
    />;
}
