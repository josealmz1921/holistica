import classes from "./whyUs.module.css";
import Image from "next/image";
const details = [
    { title: "Una sesión pensada para ti", text: "Conversamos sobre tus preferencias y lo que necesitas para dar forma a tu experiencia." },
    { title: "Un espacio para desconectar", text: "Luz suave, un ambiente tranquilo y tiempo para dejar atrás el ritmo de todos los días." },
    { title: "Atención en cada momento", text: "Tu comodidad guía la sesión. Puedes compartir cómo te sientes y ajustar la experiencia a tu ritmo." },
];
export default function WhyUs() {
    return <section id="nosotros" className={classes.root} aria-labelledby="about-title">
        <div className={classes.imageContainer}><Image fill src="/img/bed.jpg" alt="Espacio preparado para una sesión de masaje" sizes="(max-width: 767px) 100vw, 45vw" className={classes.image} /><p className={classes.imageNote}>Aquí, el tiempo es para ti.</p></div>
        <div className={classes.content}><p className={classes.eyebrow}>La esencia de Flor de luna</p><h2 id="about-title" className={classes.title}>El cuidado está<br />en los pequeños detalles.</h2>
            <ul className={classes.list}>{details.map((detail, index) => <li key={detail.title} className={classes.item}><span className={classes.number}>0{index + 1}</span><div><h3 className={classes.itemTitle}>{detail.title}</h3><p>{detail.text}</p></div></li>)}</ul>
        </div>
    </section>;
}
