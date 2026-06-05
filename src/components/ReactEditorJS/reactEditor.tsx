import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import classes from './reactEditor.module.css';
import { EDITOR_JS_TOOLS } from "./tools";
import { ReactEditorProps } from "./types";

const ReactEditor = (props: ReactEditorProps) => {

    const { name, onChange, initialValue = null } = props;

    const editorRef = useRef<EditorJS | null>(null);
    const initialized = useRef(false);
    const [editorData, setEditorData] = useState<any>(initialValue);

    const handleChange = async () => {
        if (!editorRef.current) return;
        const output = await editorRef.current.save();
        
        setEditorData(output);
        if (onChange) onChange(output)
    };

    const sanitizeData = (data: any) => {
        if (!data?.blocks) return data;

        return {
            ...data,
            blocks: data.blocks.filter(
                (block: any) => block.type !== 'checklist'
            )
        };
    };

    useEffect(() => {
        if (editorRef.current || initialized.current) return;
        initialized.current = true;
        const editor = new EditorJS({
            holder: name,
            tools: EDITOR_JS_TOOLS,
            placeholder: "Escribe los términos y condiciones...",
            autofocus: true,
            data: editorData ?? undefined,
            onReady: () => {
                editorRef.current = editor;
            },
            onChange: handleChange
        });
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [editorRef]);

    return (
        <div className={classes.editorContainer}>
            <div id={name} />
        </div>
    )
}

export default ReactEditor;
