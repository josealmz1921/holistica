import type { PageDocument } from "../../page-builder/editor";
import { HOME_SEO_TITLE, HOME_SEO_DESCRIPTION } from "../../utilities/siteSeo";

/** Local template of the existing editorial homepage. No remote reads or writes. */
export function initialPage(): PageDocument {
    const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER || ""}`;
    const customWhatsapp = `${whatsapp}?text=${encodeURIComponent("Hola, tengo una idea para un servicio personalizado y me gustaría recibir una cotización. ¿Podrían ayudarme?")}`;
    return {
        schemaVersion: 1,
        id: "home",
        title: "Inicio · Flor de luna",
        seo: { title: HOME_SEO_TITLE, description: HOME_SEO_DESCRIPTION },
        sections: [
            {
                id: "portada", type: "hero", variant: "left", visible: true,
                settings: { imageOpacity: 1, overlayOpacity: 0.85, parallax: false },
                content: {
                    eyebrow: "Flor de luna · Bienestar en Pachuca",
                    title: "Masajes tántricos en Pachuca.",
                    description: "Baja el ritmo. Vuelve a ti.\n\nExplora el masaje tántrico y nuru en Flor de luna: un espacio en Pachuca, Hidalgo, para escuchar tu cuerpo y regalarte un momento de calma, a tu ritmo y con atención personalizada.",
                    subtitle: "A tu ritmo. Con atención personalizada.\nRespira. Suelta. Reconecta.\nEl bienestar comienza con una pausa.",
                    image: { src: "/img/heroImage.jpg", alt: "Un ambiente de calma para tu sesión de masaje" },
                    actions: [
                        { label: "Reserva tu momento", href: whatsapp, priority: "primary" },
                        { label: "Explorar masajes", href: "/#servicios", priority: "secondary" },
                    ],
                },
            },
            // These sections still exist below the builder on the public homepage.
            // Keep their imported copies hidden until the owner chooses to use them.
            {
                id: "inicio-esencia", type: "banner", variant: "left", visible: false,
                content: {
                    title: "El cuidado está en los pequeños detalles.",
                    description: "La esencia de Flor de luna.\nAquí, el tiempo es para ti.",
                    image: { src: "/img/bed.jpg", alt: "Espacio preparado para una sesión de masaje" },
                },
            },
            {
                id: "inicio-cuidados", type: "cards", variant: "default", visible: false, columns: 3,
                content: {
                    title: "La esencia de Flor de luna", description: "El cuidado está en los pequeños detalles.",
                    items: [
                        { id: "sesion", title: "Una sesión pensada para ti", description: "Conversamos sobre tus preferencias y lo que necesitas para dar forma a tu experiencia." },
                        { id: "espacio", title: "Un espacio para desconectar", description: "Luz suave, un ambiente tranquilo y tiempo para dejar atrás el ritmo de todos los días." },
                        { id: "atencion", title: "Atención en cada momento", description: "Tu comodidad guía la sesión. Puedes compartir cómo te sientes y ajustar la experiencia a tu ritmo." },
                    ],
                },
            },
            {
                id: "inicio-visitantes", type: "text", variant: "left", visible: false,
                content: {
                    eyebrow: "Tu pausa, en Pachuca",
                    title: "Un espacio en Pachuca, también para quienes vienen de fuera.",
                    description: "Flor de luna es un espacio de masajes tántricos y nuru en Pachuca, Hidalgo. Recibimos a personas de la ciudad y sus alrededores, así como a visitantes de CDMX y el Estado de México.\n\nSi vienes de otra ciudad, agenda tu sesión antes de viajar. Por WhatsApp podemos orientarte sobre la ubicación y resolver tus dudas para que prepares tu visita con calma.",
                    actions: [{ label: "Consulta la ubicación y planea tu visita", href: whatsapp }],
                },
            },
            {
                id: "inicio-pasos", type: "cards", variant: "default", visible: false, columns: 3,
                content: {
                    eyebrow: "Tu experiencia", title: "Solo tienes que darte el tiempo.", description: "Tu experiencia",
                    items: [
                        { id: "elige", title: "Elige tu sesión", description: "Explora los masajes y encuentra el que conecta con lo que necesitas." },
                        { id: "conversemos", title: "Conversemos", description: "Escríbenos por WhatsApp para resolver tus dudas y coordinar tu visita." },
                        { id: "pausa", title: "Permítete una pausa", description: "Llega, respira y disfruta de un momento dedicado a ti." },
                    ],
                },
            },
            {
                id: "inicio-personalizado", type: "text", variant: "center", visible: false, tone: "panel",
                content: {
                    eyebrow: "Una experiencia a tu medida", title: "Tu momento de calma, a tu manera.",
                    description: "Si buscas una experiencia diferente o un servicio que no aparece en nuestro catálogo, envíanos tu propuesta. Cuéntanos qué necesitas y prepararemos una cotización personalizada para ti.",
                    actions: [{ label: "Cuéntanos qué necesitas", href: customWhatsapp }],
                },
            },
        ],
    };
}
