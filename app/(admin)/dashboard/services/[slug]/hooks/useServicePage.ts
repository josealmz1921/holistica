import { useEffect, useState, useMemo } from "react";
import { serverTimestamp } from "firebase/firestore";
import { type FormState } from "informed";

import { useRouter, useSearchParams } from 'next/navigation'

import { type PreviewFile } from "@/src/components/Dropzone/types";
import { uploadImage } from "@/src/utilities/cloudinary";
import { getServiceById, createService, updateService } from "@/src/firebase/getServices";
import { deleteImage } from "@/src/cloudinary/deleteImage";
import { createSlug } from "@/src/utilities/helpers";
import { getCategories } from "@/src/firebase/categories";

import Swal from "sweetalert2";


export const useServicePage = () => {

    const [dropzoneFiles, setDropzoneFiles] = useState<PreviewFile[]>([])
    const [service, setService] = useState<any>();
    const [categories, setCategories] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const searchParams = useSearchParams()
    const id = <string>searchParams.get('id')

    const router = useRouter()

    const initialValues = useMemo(() => {
        if (!service) return {};
        const {
            name,
            route,
            category,
            gallery,
            id,
            description,
            benefits,
            active,
            duration,
            message
        } = service;
        console.log('service', service);

        return {
            name,
            route,
            category: category.id,
            id,
            benefits,
            active,
            duration,
            message,
            desc: description,
            gallery: gallery?.map((img: any) => {
                return {
                    ...img,
                    preview: img.url,
                    id: img.publicId,
                }
            })
        }
    }, [service])

    const uploadImages = async () => {
        const finalGallery: any[] = [];

        for (const image of dropzoneFiles as any[]) {

            // Imagen existente
            if (image.publicId) {
                finalGallery.push({
                    url: image.url,
                    publicId: image.publicId,
                    width: image.width,
                    height: image.height
                });

                continue;
            }

            // Imagen nueva
            if (image.file) {
                const result = await uploadImage(image.file);

                finalGallery.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height
                });
            }
        }

        return finalGallery;
    };

    const handleSubmit = async (data: FormState) => {
        const { values } = data;

        try {

            const gallery = await uploadImages();

            const service = {
                name: (values.name as string)?.trim(),
                slug: createSlug(values.name as string),

                category: values.category || "",

                description: (values.desc as string)?.trim(),

                duration: Number(values.duration),

                active: Boolean(values.active),

                message: values.message,

                gallery,

                thumbnail: gallery[0]?.url || null,

                benefits: values.benefits || [],

                route:
                    (values.route as any[])?.map(
                        (item: any, index: number) => ({
                            step: index + 1,
                            title: item.title,
                            description: item.description
                        })
                    ) || [],

                updatedAt: serverTimestamp(),

                ...(id
                    ? {}
                    : {
                        createdAt: serverTimestamp()
                    })
            };

            if (id) {
                await updateService(id, service);
            } else {
                await createService(service);
            }

            await Swal.fire({
                icon: "success",
                html: `Servicio ${id ? "actualizado" : "creado"} con éxito`,
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                }
            });

            router.back();

        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                html: `Error al guardar el servicio`,
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                }
            });
        }
    };

    const loadService = async (id: string) => {
        try {
            const response = await getServiceById(id);
            setService(response);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (id && !service) {
                await loadService(id);
                setLoading(false)
            }
        };
        init();
    }, [id, service]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            const cats = response.map((cat: any) => {
                if (!cat.active) return null
                return {
                    label: cat.name,
                    value: cat.id
                }
            }).filter(Boolean)
            setCategories(cats);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await loadCategories();
            setLoadingCategories(false)
        };
        init();
    }, [id, service]);

    const handleDeleteImage = async (
        idImage?: string
    ) => {
        try {
            if (!idImage) return;
            await deleteImage(idImage);

            const newGallery = dropzoneFiles.filter(
                (image: any) => image?.id !== idImage
            );

            await updateService(id, {
                gallery: newGallery
            });

            await Swal.fire({
                icon: "success",
                html: `Imagen eliminada correctamente`,
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                }
            });


        } catch (error) {
            console.log(error);

            Swal.fire({
                icon: "error",
                html: `Error al eliminar la imagen`,
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                }
            });
        }
    };


    return {
        loading: (loading && id) || loadingCategories,
        initialValues,
        categories,
        handleSubmit,
        setDropzoneFiles,
        handleDeleteImage
    }
}