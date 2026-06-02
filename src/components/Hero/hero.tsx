import classes from './hero.module.css';
import {ArrowRightIcon} from '../Icons/icons';

const Hero = () => {
    return (
        <section className={classes.root}>
            <div className={classes.content}>
                <h2 className={classes.title}>Restauración y Calma</h2>
                <h1 className={classes.heading}>Tu momento de paz comienza aquí</h1>
                <p className={classes.description}>Experimenta la fusión perfecta entre técnicas terapéuticas <br /> avanzadas y un entorno diseñado para tu desconexión total.</p>
                <a href="https://wa.me/527711814454" target="_blank" rel="noopener noreferrer" className={classes.whatsappLink}>
                    RESERVA POR WHATSAPP
                    <ArrowRightIcon className='size-5 ml-2'
                     />
                </a>
            </div>
        </section>
    );
}

export default Hero;