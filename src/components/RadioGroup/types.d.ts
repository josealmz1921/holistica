import { CallbackFunction } from "../Input/types";

export interface RadioItem {
  id: string;
  label: string;
  value: string;
  activeClass?: string;
  disable?: boolean;
  disabled?: boolean;
}

export interface MyRadioGroupProps {
  name: string;
  data: RadioItem[];
  disabled?: boolean;
  validate?: CallbackFunction,
  onChange?: (values: any) => void
}

export type OrderItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  attributes: { label: string; value: string }[];
  subTotal: string;
}
