import classes from './dropzone.module.css';
import { AddImageIcon, DeleteIcon, CompareArrowsIcons } from "@/src/components/Icons/icons";
import SortableItem from "./components/SortableItem";

import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import useDropzone from './hooks/useDropzone';
import type { DropzoneProps } from './types';

function Dropzone(props: DropzoneProps) {

    const { disabled, maxFiles } = props;

    const {
        files,
        atLimit,
        processing,
        sensors,
        isDragActive,
        handleDragEnd,
        getRootProps,
        getInputProps,
        removeImage,
    } = useDropzone(props)

    return (
        <div className={`${classes.root} ${maxFiles === 1 ? classes.single : ""}`}>
            <div className={classes.imageList}>
                <DndContext
                    sensors={disabled || processing || maxFiles === 1 ? [] : sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={files.map((f) => f.preview)}
                        strategy={verticalListSortingStrategy}
                    >
                        {files.map((fileObj, idx) => (
                            <SortableItem key={fileObj.preview} id={fileObj.preview} disabled={disabled || processing || maxFiles === 1}>
                                <div className={classes.itemDropzone}>
                                    {maxFiles !== 1 && <p>{idx + 1}</p>}
                                    <div className={classes.imageContainer}>
                                        <button
                                            type='button'
                                            aria-label="Eliminar imagen"
                                            disabled={disabled || processing}
                                            onClick={() => !disabled && removeImage(fileObj.preview, fileObj.id)}
                                            className={classes.deleteButton}
                                        >
                                            <DeleteIcon />
                                        </button>
                                        {maxFiles !== 1 && <CompareArrowsIcons className={classes.compareIcon} />}
                                        <img
                                            src={fileObj.preview}
                                            alt={fileObj?.file?.name || "Imagen seleccionada"}
                                            className={classes.img}
                                        />
                                    </div>
                                    <p className={classes.fileData}>
                                        {fileObj.width}px X {fileObj.height}px {" "}
                                        {fileObj?.file ? `${(fileObj.file.size / 1024).toFixed(1)} KB` : null}
                                    </p>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContext>
                </DndContext>
                {!atLimit && <div
                    {...getRootProps({
                        onClick: disabled ? (e) => e.preventDefault() : undefined
                    })}
                    className={`
                        ${classes.dropzone}
                        ${disabled || processing ? classes.disabledDropzone : ""}
                        ${isDragActive ? classes.dragActive : classes.dragInactive}
                    `}
                >
                    <input {...getInputProps()} aria-label="Seleccionar imagen" />
                    <AddImageIcon className={classes.icon} />
                    <p className={classes.dropzoneText}>
                        Selecciona o arrastra <br />
                        una imagen aquí
                    </p>
                </div>}
            </div>
            {processing && <p role="status">Procesando imagen…</p>}
        </div>
    );
}

export default Dropzone;