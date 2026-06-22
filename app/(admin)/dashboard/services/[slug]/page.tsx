"use client"
import { Form } from "informed"
import Input from "@/src/components/Input"
import Select from '@/src/components/Select'
import Textarea from "@/src/components/Textarea"
import { Toggle } from "@/src/components/Toggle/Toggle"
import classes from './service.module.css';
import Dropzone from "@/src/components/Dropzone"
import BenefitsField from "@/src/components/BenefitsField"
import { useServicePage } from "./hooks/useServicePage"
import { ArrowLeft } from "@/src/components/Icons/icons"
import LoaderPage from "@/src/components/LoaderPage";
import { isRequired } from "@/src/utilities/formValidations"
import Collapsible from "@/src/components/Collapsible"

import { useRouter } from 'next/navigation'

export default function ServicesPage() {

    const router = useRouter()

    const {
        loading,
        categories,
        initialValues,
        handleSubmit,
        setDropzoneFiles,
        handleDeleteImage
    } = useServicePage();

    if (loading) return <LoaderPage />

    return (
        <div className={classes.root}>
            <button
                className="my-4"
                onClick={() => {
                    router.back();
                }}>
                <ArrowLeft className='size-6' />
            </button>
            <Form initialValues={initialValues} onSubmit={handleSubmit} >
                <div className={classes.formHead}>
                    <div>
                        <h1 className={classes.title}>Crear nuevo servicio</h1>
                        <p className={classes.text}>Defina los detalles de su nueva terapia. Los cambios se reflejarán instantáneamente en su catálogo de reservas.</p>
                    </div>
                    <button className={classes.saveButton}>Guardar</button>
                </div>
                <div className={classes.form}>
                    <Input className={classes.name} identifier="name" label="Nombre" validate={isRequired} />
                    <div className={classes.category}>
                        <Select name="category" label="Categoria" options={categories} validate={isRequired} />
                    </div>
                    <Textarea className={classes.desc} label="Descripcion" identifier="desc" type={'type'} validate={isRequired} />
                    <Textarea className={classes.message} label="Mensaje para whatsapp" identifier="message" type={'type'} validate={isRequired} />
                    <Input className={classes.duration} identifier="duration" label="Duracion" after={'min'} type={'number'} validate={isRequired} />
                    <div className={classes.status}>
                        <Toggle label="Status" name="active" initialValue={initialValues?.active} />
                    </div>
                    <div className={classes.dropzone}>
                        <Dropzone
                            getValues={setDropzoneFiles}
                            initialValues={initialValues.gallery}
                            onDelete={handleDeleteImage}
                        />
                    </div>

                    <div className={classes.benefits}>
                        <Collapsible title="Beneficios">
                            <BenefitsField
                                name='benefits'
                                validate={isRequired}
                                title="Beneficios"
                            />
                        </Collapsible>
                    </div>

                    <div className={classes.route}>
                        <Collapsible title="Ruta del masaje">
                            <BenefitsField 
                            name='route' 
                            title="Ruta del masaje" 
                            validate={isRequired} 
                            />
                        </Collapsible>
                    </div>

                    <div className={classes.seo}>
                        <Collapsible title="SEO y Redes Sociales">
                            <div className={classes.seoForm}>
                                <Input
                                    identifier="seoTitle"
                                    label="Título SEO"
                                />

                                <Textarea
                                    identifier="seoDescription"
                                    label="Descripción SEO"
                                    type='text'
                                />

                                <Input
                                    identifier="ogTitle"
                                    label="Título para Facebook y WhatsApp"
                                />

                                <Textarea
                                    identifier="ogDescription"
                                    label="Descripción para Facebook y WhatsApp"
                                    type='text'

                                />

                                <Input
                                    identifier="twitterTitle"
                                    label="Título para X"
                                />

                                <Textarea
                                    identifier="twitterDescription"
                                    label="Descripción para X"
                                    type='text'
                                />
                            </div>
                        </Collapsible>
                    </div>
                </div>
            </Form >
        </div >
    )
}
