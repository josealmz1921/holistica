import classes from './loader.module.css';
import loaderAnimation from './loaderAnimation.json';
import Lottie from "lottie-react";

const LoaderPage = () => {
    return (
        <div className={classes.root}>
            <Lottie className={classes.loader} animationData={loaderAnimation} loop={true} />
        </div>
    )
}

export default LoaderPage;