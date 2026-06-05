"use client";

import { useEffect, useState } from "react";
import { getServices, deleteService } from "@/src/firebase/getServices";
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
        refetchServices: loadServices,
    };
};