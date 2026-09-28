import Image from "next/image";
import classes from "./services.module.css";

import { getServices } from "@/src/firebase/getServices";
import Link from "next/link";

const Services = async () => {

    const services = await getServices();

    return (
        <section id="servicios" className={classes.root} aria-labelledby="services-title">
            <div className={classes.header}><p className={classes.eyebrow}>Encuentra tu momento</p><h2 id="services-title" className={classes.title}>Una experiencia para cada necesidad</h2><p className={classes.intro}>Elige cómo quieres sentirte. Nosotros te acompañamos en el camino.</p></div>
            <div className={classes.servicesContainer}>
                {services.map((service) => {
                    if(!service?.active) return null;
                    const mainImage = service?.gallery?.[0]?.url;
                    return (
                        <div key={service.id} className={classes.service}>
                            <div className={classes.imageContainer}>
                                <Image
                                    fill
                                    src={mainImage || '/img/no-image.jpg'}
                                    alt={service.name}
                                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                                />
                            </div>

                            <div className={classes.description}>
                                <h3 className={classes.serviceTitle}>
                                    {service.name}
                                </h3>

                                <p className={classes.summary}>{service.description}</p>

                                <Link
                                    className={classes.agendar}
                                    href={`/${service.slug}`}
                                    rel="noopener noreferrer"
                                >
                                    Descubrir masaje ↗
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    );
}

export default Services;
