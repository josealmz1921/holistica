import type {SelectMeta, SelectOption} from "@utilities/types/selectTypes";

interface UseSelectResult<T, O extends SelectOption<T> = SelectOption<T>> {
    // state
    open: boolean;
    highlighted: number;
    value: T | null | undefined;
    selectedOption: O | null;
    disabled: boolean;

    // refs
    triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
    listRef: React.MutableRefObject<HTMLDivElement | null>;

    // actions
    toggleOpen: () => void;
    openList: () => void;
    closeList: () => void;
    makeSelection: (opt: O, index: number, meta?: SelectMeta) => void;
    setHighlighted: React.Dispatch<React.SetStateAction<number>>;

    // handlers
    onTriggerKeyDown: (e: React.KeyboardEvent) => void;
    onListKeyDown: (e: React.KeyboardEvent) => void;

    // passthrough props
    placeholder: string;
    id?: string;
}

export type {
    UseSelectResult
}