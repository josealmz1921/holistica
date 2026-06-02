"use client";
import { useEffect, useState, useRef } from "react";
import classes from "./header.module.css";
import { BurgerIcon } from "../Icons/icons";
import { useIsMobile } from "@/src/hooks/useIsMobile";

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
            <h1 className={classes.title}>Holistica</h1>
            <nav className={classes.nav}>
                {
                    ((isMobile && isMenuOpen) || !isMobile) && (
                        <ul ref={wrapperRef} className={classes.list}>
                            <li><a href="#" className={classes.link}>Servicios</a></li>
                            <li><a href="#" className={classes.link}>Nosotros</a></li>
                            <li><a href="#" className={classes.link}>Experiencia</a></li>
                            <li className={classes.whatsappContainer}>
                                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className={classes.whatsapp}>
                                    Reserva por WhatsApp
                                </a>
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