import CategoriesAction from "@/src/components/CategoriesActions";
import { PencilIcon } from '@/src/components/Icons/icons';
import classes from './categories.module.css';
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
        <div>
            <CategoriesAction categoryId={edit} />
            <div className="p-4">
                <div className={classes.tableHead}>
                    <p>Nombes</p>
                    <p>Acciones</p>
                </div>
                {categories?.map((category: any) => {
                    return (
                        <div key={category.id} className={classes.tableRow}>
                            <p>{category.name}</p>
                            <div className={classes.actionContainer}>
                                <Link href={`/dashboard/categories?edit=${category.id}`}>
                                    <PencilIcon className="size-6" />
                                </Link>
                                <DeleteButtonCategory id={category.id} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}