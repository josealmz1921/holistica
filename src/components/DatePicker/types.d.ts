import { CallbackFunction } from "../Input/types"

export type DatePickerProps = {
    field: string
    label?: string
    minDate?: Date
    maxDate?: Date
    required?: boolean
    validate?: CallbackFunction,
    disabled?: boolean
}