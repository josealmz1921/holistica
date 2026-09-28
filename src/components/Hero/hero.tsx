import Image from "next/image";
import classes from "./hero.module.css";

export default function Hero() {
    return <section className={classes.root} aria-labelledby="home-title">
        <div className={classes.content}>
            <p className={classes.eyebrow}>Flor de luna · Bienestar en Pachuca</p>
            <h1 id="home-title" className={classes.heading}>Baja el ritmo.<br /><em>Vuelve a ti.</em></h1>
            <p className={classes.description}>Un espacio para soltar la tensión, escuchar tu cuerpo y regalarte ese momento de calma que tanto necesitas.</p>
            <div className={classes.actions}>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}`} target="_blank" rel="noopener noreferrer" className={classes.whatsappLink}>Reserva tu momento <span aria-hidden="true">↗</span></a>
                <a href="#servicios" className={classes.explore}>Explorar masajes <span aria-hidden="true">↓</span></a>
            </div>
            <p className={classes.note}><span aria-hidden="true" /> A tu ritmo. Con atención personalizada.</p>
        </div>
        <div className={classes.visual}>
            <Image src="/img/heroImage.jpg" alt="Un ambiente de calma para tu sesión de masaje" fill sizes="(max-width: 767px) 100vw, 50vw" preload className={classes.image} />
            <div className={classes.caption}><span>Respira. Suelta. Reconecta.</span><p>El bienestar comienza con una pausa.</p></div>
        </div>
    </section>;
}
