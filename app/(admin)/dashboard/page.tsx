import Link from "next/link";
import classes from "./dashboard.module.css";

export default async function DashboardPage() {
    return (
        <div className={classes.root}>
            <h1 className={classes.title}>Bienvenido!</h1>
            <div>
                <div className={classes.tableTitle}>Principales servicios</div>
                <p>
                    Gestiona servicios, categorías, contenido y configuraciones desde un solo lugar. Todos los cambios realizados aquí se reflejarán automáticamente en tu sitio web.
                </p>
            </div>
        </div>
    );
};