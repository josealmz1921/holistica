import Image from "next/image";
import classes from "./services.module.css";

import { getServices } from "@/src/firebase/getServices";
import Link from "next/link";

const Services = async () => {

    const services = await getServices();

    return (
        <div id="servicios" className={classes.root}>
            <h1 className={classes.title}>Nuestros masajes</h1>
            <div className={classes.servicesContainer}>
                {services.map((service: any) => {                    
                    const mainImage = service?.gallery?.[0]?.url;
                    return (
                        <div key={service.id} className={classes.service}>
                            <div className={classes.imageContainer}>
                                <Image
                                    fill
                                    src={mainImage || '/img/no-image.jpg'}
                                    alt={mainImage || '/img/no-image.jpg'}
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>

                            <div className={classes.description}>
                                <p className={classes.serviceTitle}>
                                    {service.name}
                                </p>

                                <p>{service.description}</p>

                                <Link
                                    className={classes.agendar}
                                    href={`${service.slug}`}
                                    rel="noopener noreferrer"
                                >
                                    Ver servicio
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default Services;