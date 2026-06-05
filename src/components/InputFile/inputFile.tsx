import { Fragment } from "react";
import Input from "@components/Input";
import defaultClasses from "./inputFile.module.css";
import Message from "../Message";
import { TrashIcon as Trash } from "../Icons";
import type { InputFileProps } from "./types";
import { useInputFile } from "./hooks/useInputFile";

const InputFile = (props: InputFileProps) => {
    const {
        label,
        field,
        after,
        before,
        validate,
        classes: classesProp,
        type = "native",
        ...restProps
    } = props;

    const {
        value,
        isNative,
        fileInputRef,
        isFileValue,
        removeFile,
        handleOnChange
    } = useInputFile({
        name: field,
        type,
        validate,
        onChange: props.onChange
    });

    const classes = { ...defaultClasses, ...classesProp };

    const inputFileClass = isNative
        ? classes.input_file
        : classes.input_file_hide;

    const showFilePreview = isFileValue(value);
    const showRemoveInsideButton = isNative && showFilePreview;
    const showPreviewBelow = !isNative && showFilePreview;

    return (
        <>
            <div className={classes.root}>
                <button type="button" className={classes.input_file_button}>
                    {before}
                    {label && <span>{label}</span>}
                    <input
                        ref={fileInputRef}
                        {...restProps}
                        onChange={handleOnChange}
                        className={inputFileClass}
                        type="file"
                    />
                    {showRemoveInsideButton && (
                        <button
                            onClick={removeFile}
                            type="button"
                            className={classes.delete_button}
                        >
                            <Trash className="size-4" />
                        </button>
                    )}
                    {after}
                    <div className={classes.input_hide}>
                        <Input identifier={field} validate={validate} />
                    </div>
                </button>
                {showPreviewBelow && (
                    <div className={classes.file_data_container}>
                        <p className={classes.file_name}>{value.name}</p>
                        <button
                            onClick={removeFile}
                            type="button"
                            className={classes.delete_button}
                        >
                            <Trash className="size-4" />
                        </button>
                    </div>
                )}
            </div>
            <Message field={field} />
        </>
    );
};

export default InputFile;
