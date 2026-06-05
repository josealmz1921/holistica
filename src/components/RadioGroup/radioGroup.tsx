import {
    RadioGroup as RadioGroupInformed,
    Radio,
    useField
} from "informed";
import classes from "./radioGroup.module.css";
import type { MyRadioGroupProps } from "./types";
import Message from "../Message";

const RadioGroup = ({
    name,
    data,
    disabled = false,
    validate,
    onChange
}: MyRadioGroupProps) => {
    const { fieldState, fieldApi } = useField({
        name
    });
    const currentValue = fieldState?.value;
    return (
        <RadioGroupInformed 
        showErrorIfError={false}
            showErrorIfTouched={false}
        name={name} disabled={disabled} validate={validate}>
            <div className={disabled ? classes.rootDisable : classes.root}>
                {data.map((radio) => {
                    const itemDisabled = disabled || radio.disabled || radio.disable;
                    return (
                        <label
                            key={radio.id}
                            onClick={itemDisabled
                                ? undefined
                                : () => {
                                    onChange?.(radio)
                                    fieldApi.validate()
                                }}
                            className={`
                            ${classes.radio}
                            ${currentValue === radio.value ? classes[`radioActive${currentValue}`] : ""}
                            ${itemDisabled ? classes.disabledRadio : ""}
                        `}
                        >
                            <Radio
                                label={radio.label}
                                value={radio.value}
                                disabled={itemDisabled}
                            />
                        </label>
                    );
                })}
            </div>
            <Message field={name} />
        </RadioGroupInformed>
    );
};

export default RadioGroup;
