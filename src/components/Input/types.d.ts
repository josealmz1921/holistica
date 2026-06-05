import type { inputType } from "@utilities/types/inputTypes";

export type CallbackFunction = (
  value: unknown,
  values: Record<string, unknown>
) => unknown;

export type InputProps = {
  identifier: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  type?: inputType;
  className?: string;
  validate?: CallbackFunction;
  disabled?: boolean;
  after?: JSX.Element;
  before?: JSX.Element;
};
