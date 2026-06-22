import { MessageIcon } from "@/src/components/Icons/icons";
import classes from "./service.module.css";
import Image from "next/image";
import SessionJourney from "@/src/components/SessionJourney";
import ImageCarousel from "@/src/components/ImageCarousel/imageCarousel";
import { getServiceBySlug } from "@/src/firebase/getServices";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const service: any = await getServiceBySlug(slug);

    if (!service) {
        return {
            title: "Servicio no encontrado"
        };
    }

    const image =
        service.ogImage ||
        service.mainImage ||
        service.gallery?.[0]?.url ||
        `${SITE_URL}/img/bed.jpg`;

    const twitterImage =
        service.twitterImage ||
        service.ogImage ||
        image;

    const description =
        service.seoDescription ||
        service.shortDescription ||
        service.description?.slice(0, 160) ||
        service.name;

    const url = `${SITE_URL}/services/${slug}`;

    return {
        title:
            service.seoTitle ||
            `${service.name} | Masajes Profesionales`,

        description,

        keywords: [
            service.name,
            service.category?.name,
            "masajes",
            "bienestar",
            "relajación",
            "terapia corporal"
        ],

        alternates: {
            canonical: url
        },

        openGraph: {
            type: "website",
            locale: "es_MX",
            url,
            title:
                service.ogTitle ||
                service.seoTitle ||
                service.name,

            description:
                service.ogDescription ||
                description,

            siteName: "Masajes Profesionales",

            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt:
                        service.ogTitle ||
                        service.name
                }
            ]
        },

        twitter: {
            card: "summary_large_image",

            title:
                service.twitterTitle ||
                service.ogTitle ||
                service.seoTitle ||
                service.name,

            description:
                service.twitterDescription ||
                service.ogDescription ||
                description,

            images: [twitterImage]
        },

        robots: {
            index: true,
            follow: true
        }
    };
}

export default async function ServicePage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const service: any = await getServiceBySlug(slug);

    if (!service) {
        notFound();
    }

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <div className={classes.carrouselContainer}>
                    <ImageCarousel
                        images={
                            service?.gallery?.map(
                                (gallery: any) => gallery.url
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

                    <p className={classes.description}>
                        {service.description}
                    </p>

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
                        (benefit: any, i: number) => (
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