"use client"

import Link from "next/link";
import {
    HomeIcon,
    WrenchScrewdriverIcon,
    ArrowLeftOnRectangleIcon,
    ListBulletIcon
} from "@heroicons/react/24/outline";

import { logout } from "@/src/firebase/auth";

import { LogoIcon, MiniLogo } from "../Icons/icons";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    return (
        <>
            {/* Desktop */}
            <nav className={styles.desktop}>
                <div className={styles.logoContainer}>
                    <LogoIcon className={styles.logo} />
                </div>

                <Link href="/dashboard" className={styles.link}>
                    <HomeIcon className={styles.icon} />
                    <span>Home</span>
                </Link>

                <Link href="/dashboard/services" className={styles.link}>
                    <WrenchScrewdriverIcon className={styles.icon} />
                    <span>Servicios</span>
                </Link>

                <Link href="/dashboard/categories" className={styles.link}>
                    <ListBulletIcon className={styles.icon} />
                    <span>Categorias</span>
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
                <Link href="/dashboard" className={styles.mobileLink}>
                    <HomeIcon className={styles.mobileIcon} />
                    <span>Home</span>
                </Link>

                <Link href="/dashboard/services" className={styles.mobileLink}>
                    <WrenchScrewdriverIcon className={styles.mobileIcon} />
                    <span>Servicios</span>
                </Link>

                <div className={styles.mobileLogo}>
                    <MiniLogo className={styles.mobileLogoSvg} />
                </div>

                <Link href="/dashboard/categories" className={styles.mobileLink}>
                    <ListBulletIcon className={styles.mobileIcon} />
                    <span>Categorias</span>
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