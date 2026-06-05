import { JSX } from "react";

export type BulkActionsProps = {

    variant?:
    | "outline-primary"
    | "outline-danger"
    | "outline-gray"
    | "solid"
    | "ghost";
    label?: string | JSX.Element;
    placeholder?: string
    classes?: { [key: string]: string };
    disabled?: boolean;
    actions?: Array<{
        onClick?: () => void;
        label: string;
        icon?: JSX.Element;
    }>
};