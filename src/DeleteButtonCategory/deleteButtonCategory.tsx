"use client"
import { TrashIcon } from "@heroicons/react/24/outline"
import { deleteCategory } from "../firebase/categories"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"

const DeleteButtonCategory = ({ id }: any) => {

    const router = useRouter();

    const handleDeleteService = async (id: string) => {
        try {
            await deleteCategory(id);
            // Refetch

            router.refresh();

            await Swal.fire({
                icon: "success",
                html: "categoria eliminada",
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                },
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                html: "Error al eliminar la categoria",
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                },
            });
        }
    };

    return (
        <button
            onClick={() => handleDeleteService(id)}
        >
            <TrashIcon className='size-6 cursor-pointer' />
        </button>
    )
}

export default DeleteButtonCategory;