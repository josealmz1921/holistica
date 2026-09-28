"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData, ToolConstructable } from "@editorjs/editorjs";
import styles from "./blogEditor.module.css";

export interface TextEditorApi { save: () => Promise<OutputData> }
export default function BlogEditor({ initialValue, apiRef }: {
    initialValue: OutputData;
    apiRef: RefObject<TextEditorApi | null>;
}) {
    const holder = useRef<HTMLDivElement>(null);
    const initial = useRef(initialValue);
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
                const [{ default: Editor }, { default: Header }, { default: List }] = await Promise.all([
                    import("@editorjs/editorjs"), import("@editorjs/header"), import("@editorjs/list"),
                ]);
                if (cancelled || !holder.current) return;
                editor = new Editor({
                    holder: holder.current,
                    data: initial.current,
                    placeholder: "Escribe el contenido de tu entrada…",
                    minHeight: 250,
                    inlineToolbar: ["bold", "italic", "link"],
                    tools: {
                        header: { class: Header, inlineToolbar: true, config: { levels: [2, 3], defaultLevel: 2 } },
                        list: { class: List as unknown as ToolConstructable, inlineToolbar: true },
                    },
                });
                await editor.isReady;
                if (cancelled) { destroy(); return; }
                apiRef.current = {
                    save: async () => {
                        const data = await editor!.save();
                        if (data.blocks.some(block => !["paragraph", "header", "list"].includes(block.type))) {
                            throw new Error("El editor solo admite texto.");
                        }
                        return data;
                    }
                };
            } catch {
                if (!cancelled) setError(true);
            }
        }
        void init();
        return () => {
            cancelled = true;
            apiRef.current = null;
            destroy();
        };
    }, [apiRef]);
    
    return <div className={styles.editor}>
        {error && <p role="alert">No se pudo cargar el editor. Recarga la página para intentarlo de nuevo.</p>}
        <div ref={holder} />
    </div>;
}
