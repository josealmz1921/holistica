"use client"
import type { RefObject } from "react";
import { useDialog } from "./hooks/useDialog";
import { DialogProps } from "./types";
import classes from './dialog.module.css';
import { XMarkIcon } from "@heroicons/react/24/outline"; 
import Portal from "../Portal";

const Dialog = (props: DialogProps) => {

    const { children, isOpen, onClose } = props;
    const { modalRef } = useDialog(props);

    if (!isOpen) return null;

    return (
        <Portal>
            <div className={classes.root}>
                <div
                    ref={modalRef as RefObject<HTMLDivElement>}
                    className={classes.content}>
                    <button type="button" onClick={onClose} className={classes.closeButton}>
                        <XMarkIcon className={classes.icon} />
                    </button>
                    {children}
                </div>
            </div>
        </Portal>
    )
}

export default Dialog;