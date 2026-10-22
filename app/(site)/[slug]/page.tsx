import { MessageIcon } from "@/src/components/Icons/icons";
import classes from "./service.module.css";
import Image from "next/image";
import SessionJourney from "@/src/components/SessionJourney";
import ImageCarousel from "@/src/components/ImageCarousel/imageCarousel";
import { getServiceBySlug } from "@/src/firebase/getServices";
import { notFound } from "next/navigation";
import ServiceDescription from "@/src/components/ServiceDescription/serviceDescription";
import PageAnalytics from "@/src/components/Analytics/pageAnalytics";
import { cache } from "react";
import type { Metadata } from "next";
import { serviceMetadata } from "@/src/utilities/siteSeo";

const getService = cache(getServiceBySlug);

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;

    const service = await getService(slug);

    if (!service) {
        return {
            title: "Servicio no encontrado | Flor de luna",
            robots: { index: false, follow: false },
        };
    }

    return serviceMetadata(service, slug);
}

export default async function ServicePage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const service = await getService(slug);

    if (!service) {
        notFound();
    }

    return (
        <div className={classes.root}>
            <PageAnalytics pageType="service" title={service.name} serviceId={service.id} />
            <div className={classes.container}>
                <div className={classes.carrouselContainer}>
                    <ImageCarousel
                        images={
                            service?.gallery?.map(
                                (gallery: { url: string }) => gallery.url
                            ) || []
                        }
                    />
                </div>

                <div className={classes.content}>
                    <h2 className={classes.subtitle}>
                        {service.category?.name}
                    </h2>

                    <h1 className={classes.title}>
                        {service.name}
                    </h1>

                    <div className={classes.description}>
                        <ServiceDescription text={service.description} content={service.descriptionContent} />
                    </div>

                    <div className={classes.info}>
                        <div className={classes.infoItem}>
                            <p>Duración</p>
                            <p>{service.duration} minutos</p>
                        </div>
                    </div>

                    <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=${encodeURIComponent(
                            service.message
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.button}
                    >
                        <MessageIcon className="size-6" />
                        Reserva por WhatsApp
                    </a>
                </div>
            </div>

            <div className={classes.benefitsContainer}>
                <h3 className={classes.benefitSubtitle}>
                    Beneficios
                </h3>

                <div className={classes.benefits}>
                    {service?.benefits?.map(
                        (benefit: { title: string; description: string }, i: number) => (
                            <div
                                key={i}
                                className={classes.benefit}
                            >
                                <p>{benefit.title}</p>
                                <p>{benefit.description}</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className={classes.sessionJourneyContainer}>
                <div>
                    <SessionJourney route={service.route} />
                </div>

                <div className={classes.imageContainer}>
                    <Image
                        fill
                        src="/img/bed.jpg"
                        alt={service.name}
                        className={classes.image}
                    />
                </div>
            </div>
        </div>
    );
}
