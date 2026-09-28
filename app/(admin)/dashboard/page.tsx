import Link from "next/link";
import { WrenchScrewdriverIcon, NewspaperIcon, Squares2X2Icon, UserCircleIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import ui from "@/src/components/AdminLayout/admin.module.css";
import classes from "./dashboard.module.css";

const sections = [
    { href: "/dashboard/blog", title: "Blog", description: "Escribe entradas y acompáñalas con imágenes y videos.", action: "Gestionar blog", Icon: NewspaperIcon },
    { href: "/dashboard/services", title: "Servicios", description: "Crea experiencias, edita sus detalles y decide cuáles mostrar en tu catálogo.", action: "Gestionar servicios", Icon: WrenchScrewdriverIcon },
    { href: "/dashboard/categories", title: "Categorías", description: "Organiza tus servicios para que cada persona encuentre su sesión ideal.", action: "Gestionar categorías", Icon: Squares2X2Icon },
    { href: "/dashboard/therapist", title: "Terapeuta", description: "Presenta tu experiencia y actualiza la foto y la información de tu perfil.", action: "Editar perfil", Icon: UserCircleIcon },
];

export default function DashboardPage() {
    return (
        <div className={ui.root}>
            <header className={ui.header}>
                <div><p className={ui.eyebrow}>Tu espacio de bienestar</p><h1 className={ui.title}>Bienvenido a Flor de luna</h1><p className={ui.help}>Cuida cada detalle de tu espacio desde aquí.</p></div>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={ui.primary}>Ver sitio <ArrowUpRightIcon className="size-4" /></Link>
            </header>
            <div className={classes.cards}>
                {sections.map(({ href, title, description, action, Icon }) => (
                    <Link href={href} key={href} className={classes.card}>
                        <Icon className={classes.icon} />
                        <h2>{title}</h2><p>{description}</p>
                        <span>{action}<ArrowUpRightIcon className="size-4" /></span>
                    </Link>
                ))}
            </div>
            <section className={classes.note}><h2>Un sitio que crece contigo</h2><p>Actualiza tus servicios y tu presentación para que reflejen la experiencia que ofreces en cada sesión.</p></section>
        </div>
    );
}
