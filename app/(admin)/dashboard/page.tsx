import Link from "next/link";
import classes from "./dashboard.module.css";

export default async function DashboardPage() {
    return (
        <div className={classes.root}>
            <h1 className={classes.title}>Bienvenido!</h1>
            <div>
                <div className={classes.tableTitle}>Principales servicios</div>
                <div className={classes.table}>
                    <div className={classes.tableHeader}>
                        <p>Servico</p>
                        <p>Vistas</p>
                        <p>Acciones</p>
                    </div>
                    <div className={classes.tableRow}>
                        <p>Masaje Relajante</p>
                        <p>1</p>
                        <Link href="dashboard/services/masaje-relajante">
                            <p className={classes.tableLink}>Ver mas</p>
                        </Link>
                    </div>
                </div>
            </div>
            <div>
                <p className={classes.tableTitle}>Citas</p>
            </div>
        </div>
    );
};