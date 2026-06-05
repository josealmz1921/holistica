import { useRef, RefObject } from "react";
import { UseDialogProps } from "../types";
import { useClickOutside } from "@/src/hooks/useClickOutside";

export const useDialog = (props: UseDialogProps) => {
    const { isOpen, onClose } = props;
    const modalRef = useRef<HTMLElement | null>(null)
    useClickOutside({
        ref: modalRef as RefObject<HTMLElement>,
        callback: () => {
                 if (onClose) onClose()
         },
        enabled: isOpen,
    });
    return {
        modalRef
    }
}

