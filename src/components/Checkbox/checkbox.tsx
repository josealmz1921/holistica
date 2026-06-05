/* Styles */
import classes from "./checkbox.module.css";

interface InputProps {
    identifier: string;
    label?: string;
    // value?: string;
}

function Input({identifier, label}: InputProps) {

    return (
        <div className={classes.root}>
            <span className={classes.label}>
                {label}
            </span>
            <label
                className={classes.radio}
                htmlFor={identifier}
            />
            <input
                className={classes.input}
                id={identifier}
                name={identifier}
                type={"checkbox"}
            />
        </div>
    );

}

export default Input