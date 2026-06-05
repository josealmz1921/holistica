import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';
import classes from './toolTip.module.css';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useWindowSize } from '@/src/hooks/useWindowSize';

const Tooltip = ({ content }: { content: string }) => {
    const size = useWindowSize();
    const isMobile = size.width <= 640;
    return (
        <div>
            <Tippy
                content={
                    <span className={classes.tooltipContent}>
                        {content}
                    </span>
                }
                placement={isMobile ? "bottom" : "right"}
                arrow={true}
                theme="custom-blue"
                trigger="click"
                hideOnClick={true}
            >
                <button type='button'>
                    <InformationCircleIcon />
                </button>
            </Tippy>
        </div>
    )
}

export default Tooltip;