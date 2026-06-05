export type UseClickOutsideProps = {
  ref: React.RefObject<HTMLElement>;
  callback: (event: MouseEvent | TouchEvent) => void;
  enabled?: boolean;
};