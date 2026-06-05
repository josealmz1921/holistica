import {useEffect, useState} from 'react'
import defaultClasses from './collapsible.module.css'
import {CollapsibleProps} from './types'
import {ChevronDown, ChevronUp} from '../Icons'
import clsx from 'clsx'

const Collapsible = (props: CollapsibleProps) => {
    const {
        title,
        children,
        classes: propClasses,
        defaultOpen = false,
        isOpen,
        onToggle,
        type
    } = props

    const classes = {...defaultClasses, ...propClasses}
    const [open, setOpen] = useState(defaultOpen)

    useEffect(() => {
        if (typeof isOpen === 'boolean') {
            setOpen(isOpen)
        }
    }, [isOpen])

    useEffect(() => {
        onToggle?.(open)
    }, [open, onToggle])

    const alternativeStyle = type === "comments" ? classes.comments : null;

    return (
        <div className={`${classes.container} ${alternativeStyle}`}>
            <button
                type="button"
                className={open ? classes.button : classes.buttonCollapse}
                onClick={() => setOpen(prev => !prev)}
            >
                <span className={classes.title}>{title}</span>
                <span className={classes.icon}>
                    {open ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
                </span>
            </button>

            <div
                className={clsx(
                    classes.panel,
                    !open && classes.panelHidden
                )}
            >
                {children}
            </div>
        </div>
    )
}

export default Collapsible
