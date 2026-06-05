import classes from './whyUs.module.css';
import Image from 'next/image';

const WhyUs = () => {
    return (
        <div id="nosotros" className={classes.root}>
            <div>
                <h2 className={classes.title}>¿Por qué elegirnos?</h2>
                <ul className={classes.list}>
                    <li className={classes.item}>
                        <h3 className={classes.itemTitle}>Técnicas Avanzadas</h3>
                        <p>Nuestro equipo cuenta con años de experiencia clínica y formación continua en las técnicas más avanzadas de bienestar.</p>
                    </li>
                    <li className={classes.item}>
                        <h3 className={classes.itemTitle}>Ambiente Tranquilo</h3>
                        <p>Instalaciones diseñadas bajo principios de neuroarquitectura para inducir un estado de relajación profunda desde que entras.</p>
                    </li>
                    <li className={classes.item}>
                        <h3 className={classes.itemTitle}>Atención Personalizada</h3>
                        <p>Cada sesión comienza con una breve consulta para adaptar el tratamiento a tus necesidades específicas y objetivos de salud.</p>
                    </li>
                </ul>
            </div>
            <div>
                <div className={classes.imageContainer}>
                    <Image fill src={'/img/bed.jpg'} alt="¿Por qué elegirnos?" className={classes.image} />
                </div>
            </div>
        </div>
    );
}

export default WhyUs;