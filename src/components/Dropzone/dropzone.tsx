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

    const { disabled } = props;

    const {
        files,
        sensors,
        isDragActive,
        handleDragEnd,
        getRootProps,
        getInputProps,
        removeImage,
    } = useDropzone(props)

    return (
        <div className={classes.root}>
            <div className={classes.imageList}>
                <DndContext
                    sensors={disabled ? [] : sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={files.map((f) => f.preview)}
                        strategy={verticalListSortingStrategy}
                    >
                        {files.map((fileObj, idx) => (
                            <SortableItem key={fileObj.preview} id={fileObj.preview}>
                                <div className={classes.itemDropzone}>
                                    <p>{idx + 1}</p>
                                    <div className={classes.imageContainer}>
                                        <button
                                            type='button'
                                            disabled={disabled}
                                            onClick={() => !disabled && removeImage(fileObj.preview, fileObj.id)}
                                            className={classes.deleteButton}
                                        >
                                            <DeleteIcon />
                                        </button>
                                        <CompareArrowsIcons className={classes.compareIcon} />
                                        <img
                                            src={fileObj.preview}
                                            alt={fileObj?.file?.name}
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
                <div
                    {...getRootProps({
                        onClick: disabled ? (e) => e.preventDefault() : undefined
                    })}
                    className={`
                        ${disabled ? classes.disabledDropzone : classes.dropzone}
                        ${disabled ? classes.disabledDropzone : ""}
                        ${isDragActive ? classes.dragActive : classes.dragInactive}
                    `}
                >
                    <input {...getInputProps()} disabled={disabled} />
                    <AddImageIcon className={classes.icon} />
                    <p className={classes.dropzoneText}>
                        Selecciona o arrastra <br />
                        una imagen aquí
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Dropzone;