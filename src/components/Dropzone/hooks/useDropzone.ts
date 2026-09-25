import { useRef, useState, useEffect } from "react";
import type { PreviewFile, DropzoneProps } from "../types";
import Swal from "sweetalert2";
import { useDropzone as useDropzoneReact } from "react-dropzone";
import { PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { fileToBase64 } from "@/src/utilities/helpers";

const MAX_FILE_SIZE = 250 * 1024;
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;

const useDropzone = ({ getValues, initialValues = [], onDelete, disabled = false, maxFiles = 0, onProcessingChange }: DropzoneProps) => {
    const [files, setFiles] = useState<PreviewFile[]>(() => maxFiles > 0 ? initialValues.slice(0, maxFiles) : initialValues);
    const [processing, setProcessing] = useState(false);
    const pending = useRef(false);
    const filesRef = useRef(files);
    const blobUrls = useRef(new Set<string>());
    const valuesCallback = useRef(getValues);
    const processingCallback = useRef(onProcessingChange);
    useEffect(() => { valuesCallback.current = getValues; }, [getValues]);
    useEffect(() => { processingCallback.current = onProcessingChange; }, [onProcessingChange]);
    useEffect(() => { valuesCallback.current?.(files); }, [files]);
    useEffect(() => {
        const urls = blobUrls.current;
        return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
    }, []);

    const updateFiles = (next: PreviewFile[]) => {
        filesRef.current = next;
        setFiles(next);
    };
    const displayError = (text: string) => {
        void Swal.fire({ icon: "error", text, confirmButtonColor: "#000", scrollbarPadding: false });
    };
    const removeImage = async (preview: string, id?: string) => {
        if (disabled || pending.current) return;
        pending.current = true;
        setProcessing(true);
        processingCallback.current?.(true);
        try {
            await onDelete?.(id);
            updateFiles(filesRef.current.filter((file) => file.preview !== preview));
            if (blobUrls.current.delete(preview)) URL.revokeObjectURL(preview);
        } catch {
            displayError("No se pudo eliminar la imagen. Inténtalo de nuevo.");
        } finally {
            pending.current = false;
            setProcessing(false);
            processingCallback.current?.(false);
        }
    };

    const onDrop = async (acceptedFiles: File[]) => {
        if (disabled || pending.current || !acceptedFiles.length) return;
        if (maxFiles > 0 && filesRef.current.length + acceptedFiles.length > maxFiles) {
            displayError(`Solo puedes seleccionar ${maxFiles} imagen${maxFiles === 1 ? "" : "es"}. Elimina una imagen antes de agregar otra.`);
            return;
        }
        pending.current = true;
        setProcessing(true);
        processingCallback.current?.(true);
        const errors: string[] = [];
        try {
            for (const file of acceptedFiles) {
                if (file.name.length > 100 || file.size > MAX_FILE_SIZE) {
                    errors.push(`${file.name}: máximo 250 KB y 100 caracteres en el nombre.`);
                    continue;
                }
                const preview = URL.createObjectURL(file);
                blobUrls.current.add(preview);
                try {
                    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = preview;
                    });
                    if (image.width > MAX_WIDTH || image.height > MAX_HEIGHT) {
                        throw new Error("Dimensiones máximas: 1200 × 1200 px.");
                    }
                    const base64 = await fileToBase64(file);
                    updateFiles([...filesRef.current, { file, preview, width: image.width, height: image.height, base64, position: filesRef.current.length + 1 }]);
                } catch (error) {
                    URL.revokeObjectURL(preview);
                    blobUrls.current.delete(preview);
                    errors.push(`${file.name}: ${error instanceof Error ? error.message : "No se pudo leer la imagen."}`);
                }
            }
        } finally {
            pending.current = false;
            setProcessing(false);
            processingCallback.current?.(false);
        }
        if (errors.length) displayError(errors.join("\n"));
    };

    const atLimit = maxFiles > 0 && files.length >= maxFiles;
    const { getRootProps, getInputProps, isDragActive } = useDropzoneReact({
        accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
        disabled: disabled || processing || atLimit,
        multiple: maxFiles !== 1,
        maxFiles,
        onDrop,
        onDropRejected: () => displayError(maxFiles === 1 ? "Selecciona una sola imagen JPG o PNG." : "Selecciona imágenes JPG o PNG dentro del límite permitido."),
    });
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (disabled || pending.current || !over || active.id === over.id) return;
        const current = filesRef.current;
        const oldIndex = current.findIndex((file) => file.preview === active.id);
        const newIndex = current.findIndex((file) => file.preview === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        updateFiles(arrayMove(current, oldIndex, newIndex).map((file, index) => ({ ...file, position: index + 1 })));
    };
    return { files, sensors, isDragActive, handleDragEnd, getRootProps, getInputProps, removeImage, atLimit, processing };
};
export default useDropzone;
