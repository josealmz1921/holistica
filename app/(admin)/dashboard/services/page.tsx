"use client"
import { Form } from 'informed';
import Input from "@/src/components/Input";
import classes from './services.module.css';
import { Toggle } from '@/src/components/Toggle/Toggle';
import { TrashIcon, PencilIcon } from '@/src/components/Icons/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useServicesPage } from './hooks/useServicesPage';
import LoaderPage from "@/src/components/LoaderPage";


export default function ServicesPage() {

    const {
        services,
        loading,
        handleDeleteService
    } = useServicesPage();

    if (loading) return <LoaderPage />

    return (
        <div className={classes.root}>
            <div className={classes.actions}>
                <h1 className={classes.title}>Mis Servicios</h1>
                <Form className={classes.searchBar}>
                    <Input placeholder="Buscar servicio..." identifier="search" />
                </Form>
                <Link href='/dashboard/services/new' className={classes.newServiceButton}>
                    <p>+ Nuevo servicio</p>
                </Link>
            </div>
            {/* <div className={classes.information}>
                <div className={classes.itemInfo}>
                    <p>Servicios Totales</p>
                    <p>5</p>
                </div>
            </div> */}
            <Form>
                <div className={classes.table}>
                    <div className={classes.tableHeader}>
                        <p>Nombre</p>
                        <p>Estatus</p>
                        <p>Acciones</p>
                    </div>
                    {services.map((service: any) => {
                        const mainImage = service?.gallery?.[0]?.url;
                        
                        return (
                            <div key={service.id} className={classes.tableRow}>
                                <div className={classes.mainContainer}>
                                    <div className={classes.imageContainer}>
                                        <Image fill src={mainImage || '/img/no-image.jpg'} alt='/img/descontracturante.jpg' />
                                    </div>
                                    <div className={classes.names}>
                                        <p className={classes.name}>{service.name}</p>
                                        <p className={classes.category}>{service.category.name}</p>
                                    </div>
                                </div>
                                <div className={classes.toggle}>
                                    <Toggle
                                        name={`${service.id}_active`}
                                        initialValue={service.active}
                                    />
                                </div>
                                <div className={classes.actionContainer}>
                                    <Link href={`/dashboard/services/${service.slug}?id=${service.id}`}>
                                        <p className={classes.editButton}>
                                            <span>Editar</span>
                                            <PencilIcon className='size-6' />
                                        </p>
                                    </Link>
                                    <button
                                        className={classes.deleteButton}
                                        onClick={() => handleDeleteService(service.id)}
                                    >
                                        <span>Eliminar</span>
                                        <TrashIcon className='size-6 cursor-pointer' />
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                </div>
            </Form>
        </div>
    )
}