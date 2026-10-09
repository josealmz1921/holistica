"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData, ToolConstructable } from "@editorjs/editorjs";
import styles from "./serviceDescriptionEditor.module.css";

export interface ServiceDescriptionApi {
    save: () => Promise<{ content: OutputData; text: string }>;
}

function plainText(content: OutputData): string {
    const text = (html: string) => {
        const document = new DOMParser().parseFromString(html.replace(/<br\s*\/?\s*>/gi, "\n"), "text/html");
        return document.body.textContent || "";
    };
    const itemsText = (items: { content: string; items?: typeof items }[], depth = 0): string =>
        depth > 10 ? "" : items.map(item => [text(item.content), itemsText(item.items || [], depth + 1)].filter(Boolean).join("\n")).join("\n");
    return content.blocks.map(block => block.type === "paragraph"
        ? text(block.data.text || "")
        : itemsText(block.data.items || [])).join("\n\n").trim();
}

function legacyContent(text: string): OutputData {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return { blocks: text ? [{ type: "paragraph", data: { text: escaped.replace(/\r\n?|\n/g, "<br>") } }] : [] };
}

export default function ServiceDescriptionEditor({ initialText, initialContent, apiRef, disabled }: {
    initialText: string;
    initialContent?: OutputData;
    apiRef: RefObject<ServiceDescriptionApi | null>;
    disabled: boolean;
}) {
    const holder = useRef<HTMLDivElement>(null);
    const initial = useRef(initialContent || legacyContent(initialText));
    const editorRef = useRef<EditorJS | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let editor: EditorJS | undefined;
        let destroyed = false;
        const destroy = () => {
            if (editor && !destroyed && typeof editor.destroy === "function") {
                destroyed = true;
                editor.destroy();
            }
        };
        async function init() {
            try {
                const [{ default: Editor }, { default: List }, { default: Paragraph }] = await Promise.all([
                    import("@editorjs/editorjs"), import("@editorjs/list"), import("@editorjs/paragraph"),
                ]);
                if (cancelled || !holder.current) return;
                class BasicList extends List {
                    renderSettings() {
                        return super.renderSettings().filter(item => !("label" in item) || item.label !== "Checklist");
                    }
                }
                editor = new Editor({
                    holder: holder.current,
                    data: initial.current,
                    placeholder: "Escribe la descripción del servicio…",
                    minHeight: 150,
                    inlineToolbar: ["bold", "italic"],
                    tools: {
                        paragraph: { class: Paragraph as unknown as ToolConstructable, config: { preserveBlank: true }, inlineToolbar: ["bold", "italic"] },
                        list: {
                            class: BasicList as unknown as ToolConstructable,
                            inlineToolbar: ["bold", "italic"],
                            toolbox: Array.isArray(List.toolbox) ? List.toolbox.filter(item => item.data?.style !== "checklist") : List.toolbox,
                            config: { defaultStyle: "unordered", counterTypes: ["numeric"] },
                        },
                    },
                });
                await editor.isReady;
                if (cancelled) { destroy(); return; }
                editorRef.current = editor;
                apiRef.current = {
                    save: async () => {
                        const content = await editor!.save();
                        if (content.blocks.some(block => !["paragraph", "list"].includes(block.type))) {
                            throw new Error("La descripción solo admite texto básico.");
                        }
                        return { content, text: plainText(content) };
                    },
                };
            } catch {
                if (!cancelled) setError(true);
            }
        }
        void init();
        return () => {
            cancelled = true;
            apiRef.current = null;
            editorRef.current = null;
            destroy();
        };
    }, [apiRef]);

    useEffect(() => {
        if (editorRef.current) void editorRef.current.readOnly.toggle(disabled);
    }, [disabled]);

    return <div className={styles.root}>
        <p id="service-description-label" className={styles.label}>Descripción</p>
        <p className={styles.help}>Selecciona texto para usar negrita o cursiva. Usa + para añadir listas. Enter crea un párrafo; Shift + Enter, un salto de línea.</p>
        {error && <p role="alert">No se pudo cargar el editor. Recarga la página para intentarlo de nuevo.</p>}
        <div className={styles.editor} role="group" aria-labelledby="service-description-label" aria-disabled={disabled}>
            <div ref={holder} />
        </div>
    </div>;
}
