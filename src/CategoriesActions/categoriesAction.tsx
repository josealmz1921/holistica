"use client";

import { useState, useEffect } from "react";
import Dialog from "@/src/components/Dialog";
import { Form, type FormState } from "informed";
import Input from "../components/Input";
import { Toggle } from "../components/Toggle/Toggle";
import classes from "./categoriesAction.module.css";
import { usePathname, useRouter } from "next/navigation";
import {
    createCategory,
    updateCategory,
    getCategoryById
} from "../firebase/categories";
import { createSlug } from "@/src/utilities/helpers";
import Swal from "sweetalert2";
import LoaderPage from "../components/LoaderPage";

type CategoriesActionProps = {
    categoryId?: string;
};

const CategoriesAction = ({
    categoryId
}: CategoriesActionProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<{
        name?: string;
        active?: boolean;
    }>({});

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (categoryId) {
            setIsOpen(true);
        }
    }, [categoryId]);

    useEffect(() => {
        const loadCategory = async () => {
            if (!categoryId) {
                setInitialValues({});
                return;
            }

            try {
                setLoading(true);

                const category: any = await getCategoryById(categoryId);

                if (category) {
                    setInitialValues({
                        name: category.name ?? "",
                        active: category.active ?? false
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadCategory();
    }, [categoryId]);

    const handleClose = () => {
        setIsOpen(false);
        setInitialValues({});

        router.replace(pathname, {
            scroll: false
        });
    };

    const handleSubmit = async (data: FormState) => {
        const { values } = data;

        try {
            const category = {
                name: (values.name as string)?.trim(),
                slug: createSlug(values.name as string),
                active: Boolean(values.active)
            };

            if (categoryId) {
                await updateCategory(categoryId, category);
            } else {
                await createCategory(category);
            }

            await Swal.fire({
                icon: "success",
                html: `Categoría ${categoryId ? "actualizada" : "creada"} con éxito`,
                confirmButtonColor: "#000",
                scrollbarPadding: false
            });

            router.refresh();
            handleClose();
        } catch (error) {
            console.error(error);

            await Swal.fire({
                icon: "error",
                html: "Error al guardar la categoría",
                confirmButtonColor: "#000",
                scrollbarPadding: false
            });
        }
    };

    return (
        <div className="p-4">
            <div className={classes.titles}>
                <h1>Categorías</h1>

                <button
                    onClick={() => setIsOpen(true)}
                    className={classes.newCategoryButton}
                >
                    Nueva categoría +
                </button>
            </div>

            <Dialog
                isOpen={isOpen}
                onClose={handleClose}
            >
                <div className={classes.root}>
                    <div className={classes.header}>
                        <p>
                            {categoryId
                                ? "Editar categoría"
                                : "Crear categoría"}
                        </p>
                    </div>

                    {loading ? (
                        <LoaderPage />
                    ) : (
                        <Form
                            key={categoryId || "new"}
                            initialValues={initialValues}
                            onSubmit={handleSubmit}
                            className={classes.form}
                        >
                            <div>
                                <Input
                                    label="Nombre de la categoría"
                                    identifier="name"
                                />
                            </div>

                            <div className={classes.status}>
                                <Toggle
                                    label="Status"
                                    name="active"
                                    initialValue={initialValues.active ?? false}
                                />
                            </div>

                            <div className={classes.buttons}>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={classes.cancelButton}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={classes.saveButton}
                                >
                                    Guardar
                                </button>
                            </div>
                        </Form>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default CategoriesAction;