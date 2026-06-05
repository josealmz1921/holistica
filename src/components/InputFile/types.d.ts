import { CallbackFunction } from "../Input/types";

export interface FileValue {
    file: string | ArrayBuffer | null;
    name: string;
    type: string;
    size: number;
}

export interface InputFileClasses {
    root?: string;
    input_file_button?: string;
    input_file?: string;
    input_file_hide?: string;
    input_hide?: string;
    file_data_container?: string;
    file_name?: string;
    delete_button?: string;
    [key: string]: string | undefined;
}

export interface InputFileProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "onChange"> {
    validate?: CallbackFunction;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    before?: React.ReactNode;
    after?: React.ReactNode;
    label?: string | React.ReactNode;
    field: string;
    type?: "native" | "button";
    classes?: InputFileClasses;
}

export interface UseInputFileProps {
    name: string;
    type?: "native" | "button";
    validate?: CallbackFunction;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
