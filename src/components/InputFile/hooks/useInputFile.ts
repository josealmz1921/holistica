import { useRef, useCallback, ChangeEvent } from "react";
import { UseInputFileProps, FileValue } from "../types";
import { useField } from "informed";

export const useInputFile = (props:UseInputFileProps) => {

    const {
        name,
        type,
        validate,
        onChange
    } = props;

    const { fieldState, fieldApi } = useField({
        name,
        validate,
    });

    const isNative = type === "native";

    const value = fieldState.value;

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const removeFile = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        fieldApi.setValue(null);
        fieldApi.reset();
    }, [fieldApi]);

    const updateFormValue = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            fieldApi.setValue({
                base64: reader.result,
                name: file.name,
                type: file.type,
                size: file.size,
                file
            });

            fieldApi.validate();
        };

        reader.readAsDataURL(file);
    };

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateFormValue(e);
        onChange?.(e);
    };

    const isFileValue = (val: any): val is FileValue =>
        val && typeof val.name === "string";

    return {
        value,
        isNative,
        fieldState,
        fieldApi,
        fileInputRef,
        removeFile,
        isFileValue,
        handleOnChange
    }
}