"use client";
import { useState } from "react";
import { Form } from "informed";
import ui from "@/src/components/AdminLayout/admin.module.css";
import classes from "./services.module.css";
import { Toggle } from "@/src/components/Toggle/Toggle";
import { TrashIcon, PencilIcon } from "@/src/components/Icons/icons";
import Image from "next/image";
import Link from "next/link";
import { useServicesPage } from "./hooks/useServicesPage";
import LoaderPage from "@/src/components/LoaderPage";

export default function ServicesPage() {
    const [search, setSearch] = useState("");
    const { services, loading, handleDeleteService, handleToggleService } = useServicesPage();
    if (loading) return <LoaderPage />;
    const filtered = services.filter(service => `${service.name} ${service.category?.name || ""}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
    return (
        <div className={ui.root}>
            <header className={ui.header}>
                <div><p className={ui.eyebrow}>Tu espacio de bienestar</p><h1 className={ui.title}>Servicios</h1><p className={ui.help}>Gestiona las experiencias que ofreces en cada sesión.</p></div>
                <Link href="/dashboard/services/new" className={ui.primary}>+ Nuevo servicio</Link>
            </header>
            <div className={ui.toolbar}>
                <input type="search" aria-label="Buscar servicios" placeholder="Buscar por nombre o categoría…" className={ui.search} value={search} onChange={event => setSearch(event.target.value)} />
                <p className={ui.help}>{filtered.length} de {services.length} servicios</p>
            </div>
            <Form>
                <div className={ui.table}>
                    <div className={ui.tableHeader}><p>Servicio</p><p>Visibilidad</p><p>Acciones</p></div>
                    {filtered.map(service => (
                        <div key={service.id} className={ui.tableRow}>
                            <div className={classes.mainContainer}>
                                <div className={classes.imageContainer}><Image fill sizes="64px" src={service.gallery?.[0]?.url || "/img/no-image.jpg"} alt={service.name || "Servicio"} /></div>
                                <div><p className={ui.name}>{service.name}</p><p className={ui.secondary}>{service.category?.name || "Sin categoría"}</p></div>
                            </div>
                            <div className={classes.status}>
                                <Toggle name={`${service.id}_active`} initialValue={service.active} ariaLabel={`Activar ${service.name}`} onChange={active => handleToggleService(service.id, active)} />
                                <span>{service.active ? "Visible" : "Oculto"}</span>
                            </div>
                            <div className={ui.rowActions}>
                                <Link href={`/dashboard/services/${service.slug}?id=${service.id}`} aria-label={`Editar ${service.name}`}><PencilIcon /><span>Editar</span></Link>
                                <button type="button" onClick={() => handleDeleteService(service.id)} aria-label={`Eliminar ${service.name}`}><TrashIcon /><span>Eliminar</span></button>
                            </div>
                        </div>
                    ))}
                    {!filtered.length && <p className={ui.empty}>{search ? "No encontramos servicios con esa búsqueda." : "Aún no tienes servicios. Crea el primero para comenzar."}</p>}
                </div>
            </Form>
        </div>
    );
}
