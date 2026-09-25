"use client";

import { useEffect, useState } from "react";
import { getServices, deleteService, updateService } from "@/src/firebase/getServices";
import Swal from "sweetalert2";

export const useServicesPage = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadServices = async () => {
        try {
            const data = await getServices();
            setServices(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await loadServices();
            setLoading(false);
        };

        init();
    }, []);

    const handleToggleService = async (id: string, active: boolean): Promise<boolean> => {
        try {
            await updateService(id, { active });
            setServices((current) => current.map((service) =>
                service.id === id ? { ...service, active } : service
            ));
            return true;
        } catch (error) {
            console.error(error);
            await Swal.fire({
                icon: "error",
                text: "No se pudo cambiar el estado del servicio. Inténtalo de nuevo.",
                confirmButtonColor: "#000",
                scrollbarPadding: false,
            });
            return false;
        }
    };

    const handleDeleteService = async (id: string) => {
        try {

            setLoading(true)

            await deleteService(id);

            // Refetch
            await loadServices();

            await Swal.fire({
                icon: "success",
                html: "Servicio eliminado",
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                },
            });

            setLoading(false)
        } catch (error) {

            setLoading(false)

            Swal.fire({
                icon: "error",
                html: "Error al eliminar el servicio",
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                },
            });
        }
    };

    return {
        services,
        loading,
        handleDeleteService,
        handleToggleService,
        refetchServices: loadServices,
    };
};