"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent, GTM_ID, setAnalyticsConsent } from "@/src/utilities/analytics";
import styles from "./siteAnalytics.module.css";

function subscribe(callback: () => void) {
    window.addEventListener(ANALYTICS_CONSENT_EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(ANALYTICS_CONSENT_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}

export function useAnalyticsConsent() {
    return useSyncExternalStore(subscribe, getAnalyticsConsent, () => null);
}

export default function SiteAnalytics() {
    const consent = useAnalyticsConsent();
    const [editing, setEditing] = useState(false);
    const [storageError, setStorageError] = useState(false);
    useEffect(() => {
        // Also stop an already-loaded container if consent is withdrawn in another tab.
        if (getAnalyticsConsent() !== "granted" && window.gtag) {
            window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
            window.location.reload();
        }
    }, [consent]);
    const choose = (value: "granted" | "denied") => {
        if (setAnalyticsConsent(value)) { setEditing(false); setStorageError(false); }
        else setStorageError(true);
    };

    return <>
        {consent === "granted" && <Script id="flor-de-luna-gtm" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
            window.gtag('consent', 'default', {
                analytics_storage: 'granted', ad_storage: 'denied',
                ad_user_data: 'denied', ad_personalization: 'denied'
            });
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
        `}</Script>}
        {consent === null || editing ? <section className={styles.banner} aria-labelledby="analytics-consent-title">
            <div><h2 id="analytics-consent-title">¿Nos ayudas a mejorar Flor de luna?</h2><p>Si aceptas, usamos Google Analytics para saber qué servicios y artículos interesan más. Es opcional: puedes seguir navegando sin aceptar y cambiar tu elección cuando quieras.</p>
                {storageError && <p role="status">Tu navegador no permite guardar la elección. La medición permanece desactivada si no estaba autorizada.</p>}
            </div>
            <div className={styles.actions}>
                <button type="button" onClick={() => choose("denied")}>Ahora no</button>
                <button type="button" onClick={() => choose("granted")}>Aceptar y ayudar</button>
            </div>
        </section> : null}
        <button type="button" className={styles.preferences} onClick={() => setEditing(true)}>Preferencias de medición</button>
    </>;
}
