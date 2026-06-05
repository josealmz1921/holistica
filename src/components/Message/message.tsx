import { useFieldState, type FieldState } from "informed";
import classes from './message.module.css';

const Message: React.FC<{ field: string }> = ({ field }) => {
    const { error }: FieldState = useFieldState(field);
    return (
        <div className={classes.root}>
            <p className={classes.error}>{error as string}</p>
        </div>
    )
}

export default Message;