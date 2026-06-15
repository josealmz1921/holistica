"use client";
import { useEffect, useState, useRef } from "react";
import classes from "./header.module.css";
import { BurgerIcon } from "../Icons/icons";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import Link from "next/link";
import { MiniLogo } from "../Icons/icons";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isMobile = useIsMobile();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const useOutsideAlerter = (ref: any) => {
        useEffect(() => {
            function handleClickOutside(event: any) {
                if (ref.current && !ref.current.contains(event.target)) {
                    setIsMenuOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);

    return (
        <header className={classes.root}>
            <p className={classes.title}>
                <MiniLogo className="w-8" />
                <span className={classes.titleName}>Flor de luna</span>
            </p>
            <nav className={classes.nav}>
                {
                    ((isMobile && isMenuOpen) || !isMobile) && (
                        <ul ref={wrapperRef} className={classes.list}>
                            <li><Link href="/#servicios" className={classes.link}>Servicios</Link></li>
                            <li><Link href="/#nosotros" className={classes.link}>Nosotros</Link></li>
                            <li><Link href="/#experiencia" className={classes.link}>Experiencia</Link></li>
                            <li className={classes.whatsappContainer}>
                                <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}`} target="_blank" rel="noopener noreferrer" className={classes.whatsapp}>
                                    Reserva por WhatsApp
                                </Link>
                            </li>
                        </ul>
                    )
                }
                <button className={classes.menuButton} aria-label="Menu" onClick={toggleMenu}>
                    <BurgerIcon className={classes.icon} />
                </button>
            </nav>
        </header>
    );
};

export default Header;