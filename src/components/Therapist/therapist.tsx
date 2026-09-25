import Image from "next/image";
import { getTherapist } from "@/src/firebase/therapist";
import classes from "./therapist.module.css";

const Therapist = async () => {
    const therapist = await getTherapist().catch((error: unknown) => {
        console.error("No se pudo cargar el perfil del terapeuta", error);
        return null;
    });

    if (!therapist?.name) return null;

    return (
        <section className={classes.root} aria-labelledby="therapist-title">
            <div className={classes.therapistContainer}>
                <div className={classes.imageContainer}>
                    <Image
                        src={therapist.photo?.url || "/img/no-image.jpg"}
                        alt={therapist.name}
                        fill
                        sizes="(max-width: 700px) 90vw, 420px"
                        className={classes.image}
                    />
                </div>
                <div className={classes.description}>
                    <p className={classes.eyebrow}>Un espacio para ti</p>
                    <h2 id="therapist-title" className={classes.title}>Conoce a tu terapeuta</h2>
                    <span className={classes.divider} aria-hidden="true" />
                    <h3 className={classes.name}>{therapist.name}</h3>
                    <p className={classes.specialty}>{therapist.specialty}</p>
                    <p className={classes.bio}>{therapist.description}</p>
                    <a className={classes.link} href="#servicios">Explora nuestros masajes <span aria-hidden="true">↗</span></a>
                </div>
            </div>
        </section>
    );
};

export default Therapist;
