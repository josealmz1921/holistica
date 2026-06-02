import Image from "next/image";
import classes from "./services.module.css";
import services from "./services.json";

const WHATSAPP_NUMBER = "527711814454";

const Services = () => {
    return (
        <div className={classes.root}>
            <h1>Nuestros masajes</h1>
            <div className={classes.servicesContainer}>
              {services.map((service) => (
                <div key={service.id} className={classes.service}>
                    <div className={classes.imageContainer}>
                        <Image
                            fill
                            src={service.image}
                            alt={service.title}
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>

                    <div className={classes.description}>
                        <p className={classes.serviceTitle}>
                            {service.title}
                        </p>

                        <p>{service.description}</p>

                        <a
                            className={classes.agendar}
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                                service.whatsappMessage
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Agendar
                        </a>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}

export default Services;