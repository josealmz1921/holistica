"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    WrenchScrewdriverIcon,
    ArrowLeftOnRectangleIcon,
    ListBulletIcon,
    NewspaperIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";

import { logout } from "@/src/firebase/auth";

import { MiniLogo } from "../Icons/icons";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    const pathname = usePathname();
    const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return (
        <>
            {/* Desktop */}
            <nav className={styles.desktop}>
                <div className={styles.logoContainer}>
                    <MiniLogo className={styles.logo} />
                    <span className={styles.titleName}>Flor de luna</span>
                </div>

                <Link href="/dashboard" aria-current={isActive("/dashboard") ? "page" : undefined} className={styles.link}>
                    <HomeIcon className={styles.icon} />
                    <span>Inicio</span>
                </Link>

                <Link href="/dashboard/services" aria-current={isActive("/dashboard/services") ? "page" : undefined} className={styles.link}>
                    <WrenchScrewdriverIcon className={styles.icon} />
                    <span>Servicios</span>
                </Link>

                <Link href="/dashboard/categories" aria-current={isActive("/dashboard/categories") ? "page" : undefined} className={styles.link}>
                    <ListBulletIcon className={styles.icon} />
                    <span>Categorías</span>
                </Link>

                <Link href="/dashboard/therapist" aria-current={isActive("/dashboard/therapist") ? "page" : undefined} className={styles.link}>
                    <UserCircleIcon className={styles.icon} />
                    <span>Terapeuta</span>
                </Link>

                <Link href="/dashboard/blog" aria-current={isActive("/dashboard/blog") ? "page" : undefined} className={styles.link}>
                    <NewspaperIcon className={styles.icon} /><span>Blog</span>
                </Link>

                {/* <Link href="/dashboard/content" className={styles.link}>
                    <PencilSquareIcon className={styles.icon} />
                    <span>Contenido</span>
                </Link> */}

                <button onClick={() => logout()} className={styles.logout}>
                    <ArrowLeftOnRectangleIcon className={styles.icon} />
                    <span>Salir</span>
                </button>
            </nav>

            {/* Mobile */}
            <nav className={styles.mobile}>
                <Link href="/dashboard" aria-current={isActive("/dashboard") ? "page" : undefined} className={styles.mobileLink}>
                    <HomeIcon className={styles.mobileIcon} />
                    <span>Inicio</span>
                </Link>

                <Link href="/dashboard/services" aria-current={isActive("/dashboard/services") ? "page" : undefined} className={styles.mobileLink}>
                    <WrenchScrewdriverIcon className={styles.mobileIcon} />
                    <span>Servicios</span>
                </Link>

                <Link href="/dashboard/therapist" aria-current={isActive("/dashboard/therapist") ? "page" : undefined} className={styles.mobileLink}>
                    <UserCircleIcon className={styles.mobileIcon} />
                    <span>Terapeuta</span>
                </Link>

                <Link href="/dashboard/categories" aria-current={isActive("/dashboard/categories") ? "page" : undefined} className={styles.mobileLink}>
                    <ListBulletIcon className={styles.mobileIcon} />
                    <span>Categorías</span>
                </Link>

                <Link href="/dashboard/blog" aria-current={isActive("/dashboard/blog") ? "page" : undefined} className={styles.mobileLink}>
                    <NewspaperIcon className={styles.mobileIcon} /><span>Blog</span>
                </Link>

                <button onClick={() => logout()} className={styles.mobileLogout}>
                    <ArrowLeftOnRectangleIcon className={styles.mobileIcon} />
                    <span>Salir</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;