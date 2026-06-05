import { useEffect } from "react";
import { type UseClickOutsideProps } from "@/src/types/hooksTypes";

export const useClickOutside = ({
    ref,
    callback,
    enabled = true,
}: UseClickOutsideProps) => {
    useEffect(() => {
        if (!enabled) return;
        const handleClick = (event: MouseEvent | TouchEvent) => {
            if (!ref.current) return;

            if (!ref.current.contains(event.target as Node)) {
                callback(event);
            }
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("touchstart", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("touchstart", handleClick);
        };
    }, [ref, callback, enabled]);
};
