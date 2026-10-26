import styles from '@/app/(site)/home.module.css';
import Blog from './Blog/blog';
import Services from './Services';
import WhyUs from './WhyUs';
import CustomeService from './CustomeService';
import Therapist from './Therapist';

/** Retained public sections: live collections and existing navigation anchors. */
export default function HomeSections() {
    return <>
        <Services />
        <WhyUs />
        <section className={styles.visitors} aria-labelledby="visitors-title">
            <div className={styles.inner}>
                <p className={styles.eyebrow}>Tu pausa, en Pachuca</p>
                <h2 id="visitors-title" className={styles.title}>Un espacio en Pachuca, también para quienes vienen de fuera.</h2>
                <div className={styles.visitorsText}>
                    <p>Flor de luna es un espacio de masajes tántricos y nuru en Pachuca, Hidalgo. Recibimos a personas de la ciudad y sus alrededores, así como a visitantes de CDMX y el Estado de México.</p>
                    <p>Si vienes de otra ciudad, agenda tu sesión antes de viajar. Por WhatsApp podemos orientarte sobre la ubicación y resolver tus dudas para que prepares tu visita con calma.</p>
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}`} target="_blank" rel="noopener noreferrer">Consulta la ubicación y planea tu visita ↗</a>
                </div>
            </div>
        </section>
        <section id="experiencia" className={styles.experience} aria-labelledby="experience-title">
            <div className={styles.inner}>
                <p className={styles.eyebrow}>Tu experiencia</p>
                <h2 id="experience-title" className={styles.title}>Solo tienes que darte el tiempo.</h2>
                <div className={styles.steps}>
                    <div><span>01</span><h3>Elige tu sesión</h3><p>Explora los masajes y encuentra el que conecta con lo que necesitas.</p></div>
                    <div><span>02</span><h3>Conversemos</h3><p>Escríbenos por WhatsApp para resolver tus dudas y coordinar tu visita.</p></div>
                    <div><span>03</span><h3>Permítete una pausa</h3><p>Llega, respira y disfruta de un momento dedicado a ti.</p></div>
                </div>
            </div>
        </section>
        <Therapist />
        <Blog />
        <CustomeService />
    </>;
}
