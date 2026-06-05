import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown } from "@/components/Icons";
import defaultClasses from "./bulkActions.module.css";
import { type BulkActionsProps } from "./type";

const BulkActions = (props: BulkActionsProps) => {
    const {
        variant = "outline-gray",
        label = "Acciones",
        placeholder,
        classes: propClasses,
        actions,
        disabled
    } = props;
    const classes = { ...defaultClasses, ...propClasses };
    return (
        <div className={classes.root}>
            <Menu>
                <MenuButton
                    disabled={disabled}
                    className={`${classes.button}`}
                    data-label={label}
                >
                    <p>{variant.includes('outline') ? placeholder : label}</p>
                    <span><ChevronDown className={classes.icon} /></span>
                </MenuButton>

                <MenuItems className={classes.items}>
                    {actions?.map((action, i) => {
                        return (
                            <MenuItem key={i}>
                                {({ disabled }) => (
                                    <button
                                        type="button"
                                        onClick={() => action?.onClick && action?.onClick()}
                                        disabled={disabled}
                                        className={`${classes.actionButton} ${disabled ? classes.activeAction : ""
                                            }`}
                                    >
                                        {action?.icon}
                                        {action.label}
                                    </button>
                                )}
                            </MenuItem>
                        )
                    })}
                </MenuItems>
            </Menu>
        </div>
    );
};

export default BulkActions;
