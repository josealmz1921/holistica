import CategoriesAction from "@/src/components/CategoriesActions";
import { PencilIcon } from '@/src/components/Icons/icons';
import classes from "@/src/components/AdminLayout/admin.module.css";
import Link from "next/link";
import { getCategories } from "@/src/firebase/categories";
import DeleteButtonCategory from "@/src/components/DeleteButtonCategory";

type CategoriesPageProps = {
    searchParams: Promise<{ edit?: string }>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {

    const { edit } = await searchParams;

    const categories = await getCategories();

    return (
        <div className={classes.root}>
            <CategoriesAction categoryId={edit} />
            <div className={classes.table}>
                <div className={classes.tableHeader}>
                    <p>Nombre</p>
                    <p>Estado</p>
                    <p>Acciones</p>
                </div>
                {categories?.map((category: any) => {
                    return (
                        <div key={category.id} className={classes.tableRow}>
                            <p className={classes.name}>{category.name}</p>
                            <span className={category.active ? classes.badge : classes.inactive}>{category.active ? "Activa" : "Inactiva"}</span>
                            <div className={classes.rowActions}>
                                <Link href={`/dashboard/categories?edit=${category.id}`} aria-label={`Editar ${category.name}`}>
                                    <PencilIcon className="size-6" /><span>Editar</span>
                                </Link>
                                <DeleteButtonCategory id={category.id} />
                            </div>
                        </div>
                    )
                })}
                {!categories.length && <p className={classes.empty}>Aún no tienes categorías. Crea una para organizar tus servicios.</p>}
            </div>
        </div>
    )
}