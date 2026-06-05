import { JSX } from "react"

export type DialogProps = {
    isOpen: boolean;
    children: JSX.ReactNode;
    onClose: () => void;
}
export interface UseDialogProps
  extends Pick<DialogProps, "onClose" | "isOpen"> {}
