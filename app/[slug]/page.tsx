import { MessageIcon } from "@/src/components/Icons/icons"
import classes from "./service.module.css";
import Image from "next/image";
import SessionJourney from "@/src/components/SessionJourney";
import ImageCarousel from "@/src/components/ImageCarousel/imageCarousel";


export default async function ServicePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <div className={classes.carrouselContainer}>
                    <ImageCarousel
                        images={[
                            "/img/relajante.jpg",
                            "/img/descontracturante.jpg",
                            "/img/holistico.jpg",
                            "/img/nuru.webp",
                        ]}
                    />
                </div>
                <div className={classes.content}>
                    <h2 className={classes.subtitle}>Rituales de Restauración</h2>
                    <h1 className={classes.title}>Masaje Relajante</h1>
                    <p className={classes.description}>Una experiencia inmersiva diseñada para disolver la tensión muscular y restaurar la calma mental. Utilizando aceites botánicos y técnicas fluidas, este masaje es el primer paso hacia una recuperación profunda.</p>
                    <div className={classes.info}>
                        <div className={classes.infoItem}>
                            <p>Duracion</p>
                            <p>60 minutos</p>
                        </div>
                        <div className={classes.infoItem}>
                            <p>Intensidad</p>
                            <p>Media-Baja</p>
                        </div>
                    </div>
                    <a href="https://wa.me/527711814454" target="_blank" rel="noopener noreferrer" className={classes.button}>
                        <MessageIcon className="size-6" />
                        Reserva por WhatsApp
                    </a>
                </div>
            </div>
            <div className={classes.benefitsContainer}>
                <h3 className={classes.benefitSubtitle}>Beneficios</h3>
                <div className={classes.benefits}>
                    <div className={classes.benefit}>
                        <p>Claridad Mental</p>
                        <p>Reduce los niveles de cortisol y promueve un estado de relajación profunda para una mente despejada.</p>
                    </div>
                    <div className={classes.benefit}>
                        <p>Alivio Muscular</p>
                        <p>Suaviza las contracturas leves causadas por el estrés diario y la postura prolongada.</p>
                    </div>
                    <div className={classes.benefit}>
                        <p>Desintoxicación</p>
                        <p>Estimula el sistema linfático ayudando a la eliminación natural de toxinas corporales.</p>
                    </div>
                </div>
            </div>
            <div className={classes.sessionJourneyContainer}>
                <div>
                    <SessionJourney />
                </div>
                <div className={classes.imageContainer}>
                    <Image fill src={'/img/bed.jpg'} alt="¿Por qué elegirnos?" className={classes.image} />
                </div>
            </div>
        </div>
    )
}