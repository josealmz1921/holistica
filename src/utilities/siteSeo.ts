import type { Metadata } from "next";
import { siteUrl } from "./blogSeo";

export const HOME_SEO_TITLE = "Masajes tántricos en Pachuca | Flor de luna";
export const HOME_SEO_DESCRIPTION = "Descubre los masajes tántricos y nuru de Flor de luna en Pachuca, Hidalgo. Recibimos visitantes de CDMX, Edomex y alrededores. Reserva tu sesión.";

export function homeMetadata(): Metadata {
    const image = { url: siteUrl("/img/heroImage.jpg"), alt: "Un ambiente de calma para tu sesión de masaje" };
    return {
        title: HOME_SEO_TITLE,
        description: HOME_SEO_DESCRIPTION,
        alternates: { canonical: siteUrl("/") },
        openGraph: {
            type: "website", locale: "es_MX", siteName: "Flor de luna", url: siteUrl("/"),
            title: HOME_SEO_TITLE, description: HOME_SEO_DESCRIPTION, images: [image],
        },
        twitter: { card: "summary_large_image", title: HOME_SEO_TITLE, description: HOME_SEO_DESCRIPTION, images: [image] },
    };
}

type ServiceSeo = {
    name: string;
    description?: string;
    shortDescription?: string;
    seoTitle?: string;
    seoDescription?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string | null;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string | null;
    mainImage?: string;
    gallery?: { url: string }[];
};

export function serviceMetadata(service: ServiceSeo, slug: string): Metadata {
    const localName = /\bpachuca\b/i.test(service.name) ? service.name : `${service.name} en Pachuca`;
    const title = service.seoTitle?.trim() || `${localName} | Flor de luna`;
    const description = service.seoDescription?.trim() || service.shortDescription?.trim()
        || service.description?.trim().slice(0, 160) || `Conoce ${localName} en Flor de luna y reserva tu sesión.`;
    const url = siteUrl(`/${encodeURIComponent(slug)}`);
    const image = service.ogImage || service.mainImage || service.gallery?.[0]?.url || siteUrl("/img/bed.jpg");
    const ogTitle = service.ogTitle?.trim() || title;
    const ogDescription = service.ogDescription?.trim() || description;
    return {
        title, description,
        alternates: { canonical: url },
        openGraph: {
            type: "website", locale: "es_MX", siteName: "Flor de luna", url,
            title: ogTitle, description: ogDescription,
            images: [{ url: image, alt: service.ogTitle?.trim() || service.name }],
        },
        twitter: {
            card: "summary_large_image", title: service.twitterTitle?.trim() || ogTitle,
            description: service.twitterDescription?.trim() || ogDescription,
            images: [service.twitterImage || image],
        },
        robots: { index: true, follow: true },
    };
}
