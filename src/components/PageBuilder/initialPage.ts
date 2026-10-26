import type { PageDocument } from "@/src/page-builder/editor";

// Editorial starting point only: no database migration or copy of service collections.
export function initialPage(): PageDocument {
    const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER || ""}`;
    return {
        schemaVersion: 1, id: "home", title: "Inicio · Flor de luna",
        seo: { title: "Masajes tántricos en Pachuca | Flor de luna", description: "Un espacio de bienestar en Pachuca, Hidalgo. Conoce Flor de luna y prepara tu visita." },
        sections: [
            { id: "portada", type: "hero", variant: "left", visible: true, content: { eyebrow: "Flor de luna · Bienestar en Pachuca", title: "Masajes tántricos en Pachuca", description: "Baja el ritmo. Vuelve a ti. Un espacio para escuchar tu cuerpo y regalarte un momento de calma, a tu ritmo y con atención personalizada.", actions: [{ label: "Reserva tu momento", href: whatsapp }] } },
            { id: "sesiones", type: "cards", variant: "default", visible: true, columns: 2, content: { title: "Encuentra tu momento", description: "Explora las sesiones disponibles y elige la experiencia que conecta contigo.", items: [{ id: "catalogo", title: "Sesiones a tu ritmo", description: "Consulta el catálogo actual de masajes y sus detalles.", link: { text: "Explorar masajes", href: "/#servicios" } }, { id: "orientacion", title: "Atención personalizada", description: "Resolvemos tus dudas y te acompañamos a preparar tu visita.", link: { text: "Platiquemos por WhatsApp", href: whatsapp } }] } },
            { id: "visita", type: "text", variant: "center", visible: true, tone: "panel", content: { eyebrow: "Tu pausa, en Pachuca", title: "También para quienes vienen de fuera", description: "Nuestro espacio está en Pachuca, Hidalgo. Recibimos visitantes de CDMX, Estado de México y alrededores. Agenda antes de viajar y consulta la ubicación por WhatsApp.", actions: [{ label: "Planea tu visita", href: whatsapp }] } },
        ],
    };
}
