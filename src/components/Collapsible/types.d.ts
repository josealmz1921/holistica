export type CollapsibleProps = {
    title?: string;  
    children: ReactNode;
    classes?: { [key: string] : string};
    defaultOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
    isOpen?: boolean;
    type?: string;
}