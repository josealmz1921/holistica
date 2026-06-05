export type ReactEditorProps = {
    onChange?: (data: { [key: string]: any }) => void;
    onSave?: (data: { [key: string]: any }) => void;
    disabled?: boolean;
    placeHolder?: string;
    name: string;
    initialValue?: {[key: string]: any} | null;
} 