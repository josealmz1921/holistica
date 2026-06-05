import { useCallback, useState, useEffect } from "react";
import { PreviewFile } from "../types";
import Swal from "sweetalert2";
import { useDropzone as useDropzoneReact } from "react-dropzone";
import {
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    arrayMove,
} from "@dnd-kit/sortable";
import type { DropzoneProps } from "../types";
import { fileToBase64 } from "@/src/utilities/helpers";


const MAX_FILE_SIZE = 250 * 1024;
const MAX_FILE_LENGTH = 100;
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;

const useDropzone = (props: DropzoneProps) => {

    const { getValues = () => {}, initialValues = [], onDelete } = props;

    const [files, setFiles] = useState<PreviewFile[]>(initialValues);
    const displayError = (message: string) => {
        Swal.fire({
            icon: "error",
            html: `${message}`,
            confirmButtonColor: "#000",
            scrollbarPadding: false,
            didClose: () => {
                document.body.style.overflow = 'hidden';
                document.body.style.paddingRight = '0px';
            },
        });
    }

    const removeImage = async (urlBlob: string, id?: string) => {
        if (onDelete) await onDelete(id);
        const newFiles = files.filter(file => file.preview !== urlBlob);
        setFiles(newFiles);
    }

    useEffect(() => getValues(files), [files])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const errors: string[] = [];

        await Promise.all(
            acceptedFiles.map((file) => {
                return new Promise<void>((resolve) => {
                    if (file.name.length > MAX_FILE_LENGTH) {
                        errors.push(
                            `El nombre del archivo archivo <strong>${file.name}</strong> excede los <strong>100</strong> caracteres <br>`
                        );
                        resolve();
                        return;
                    }

                    if (file.size > MAX_FILE_SIZE) {
                        errors.push(
                            `El archivo <strong>${file.name}</strong> excede los <strong>250 KB</strong> <br>`
                        );
                        resolve();
                        return;
                    }

                    const previewUrl = URL.createObjectURL(file);
                    const img = new Image();

                    img.onload = async () => {
                        if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
                            errors.push(
                                `La imagen <strong>${file.name}</strong> excede las dimensiones máximas
                                <strong>${MAX_WIDTH}x${MAX_HEIGHT}px</strong> <br>`
                            );
                            URL.revokeObjectURL(previewUrl);
                            resolve();
                            return;
                        }
                        const base64 = await fileToBase64(file);
                        setFiles((prev) => {
                            const position = prev.length + 1;
                            return [
                                ...prev,
                                {
                                    file,
                                    preview: previewUrl,
                                    width: img.width,
                                    height: img.height,
                                    base64,
                                    position,
                                },
                            ];
                        });
                        resolve();
                    };
                    img.onerror = () => {
                        errors.push(
                            `No se pudo leer la imagen <strong>${file.name}</strong>`
                        );
                        URL.revokeObjectURL(previewUrl);
                        resolve();
                    };
                    img.src = previewUrl;
                });
            })
        );

        if (errors.length) {
            const messages = errors
                .map(err => `<p class="text-left text-sm">${err}</p>`)
                .join('');
            displayError(messages);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzoneReact({
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
        },
        onDrop,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = files.findIndex((f) => f.preview === active.id);
        const newIndex = files.findIndex((f) => f.preview === over.id);
        setFiles((items) => {
            const reordered = arrayMove(items, oldIndex, newIndex);
            const updated = reordered.map((item, index) => ({
                ...item,
                position: index + 1,
            }));
            return updated;
        });
    };


    useEffect(() => {
        return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
    }, [files]);

    return {
        files,
        sensors,
        isDragActive,
        handleDragEnd,
        getRootProps,
        getInputProps,
        removeImage
    }
}

export default useDropzone;