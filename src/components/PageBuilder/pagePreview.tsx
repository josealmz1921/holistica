"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebase";
import { PageRenderer, florDeLunaTheme } from "@/src/page-builder";
import { validatePageDocument, type PageDocument } from "@/src/page-builder/editor";
import { PREVIEW_KEY, pageHomeErrors } from "@/src/utilities/pageBuilder";
import Header from "@/src/components/Header/header";
import Footer from "@/src/components/Footer/footer";

export default function BuilderPreview({ children }: { children: ReactNode }) {
    const [document, setDocument] = useState<PageDocument | null>(null);
    const [message, setMessage] = useState("Comprobando acceso…");
    useEffect(() => {
        let generation = 0;
        const unsubscribe = onIdTokenChanged(auth, async user => {
            const current = ++generation;
            setDocument(null);
            try {
                if (!user || (await user.getIdTokenResult()).claims.admin !== true) throw new Error("Esta vista previa requiere una cuenta administradora.");
                const raw = sessionStorage.getItem(PREVIEW_KEY);
                if (!raw) throw new Error("Abre la vista previa desde Páginas en el administrador.");
                const result = validatePageDocument(JSON.parse(raw), { mode: "draft" });
                if (!result.success || pageHomeErrors(result.data).length) throw new Error("El borrador no es válido para la vista previa.");
                if (current === generation) setDocument(result.data);
            } catch (error) { if (current === generation) setMessage(error instanceof Error ? error.message : "No se pudo abrir la vista previa."); }
        });
        return () => { generation++; unsubscribe(); };
    }, []);
    if (!document) return <main style={{ padding: "2rem" }}><p role="status">{message}</p><Link href="/dashboard/pages">Volver a Páginas</Link></main>;
    return <><div style={{ padding: ".6rem", textAlign: "center", background: "#ece8e0" }}>Vista previa privada · cambios locales, no publicados</div><Header /><main id="contenido"><PageRenderer document={document} mode="draft" theme={florDeLunaTheme} />{children}</main><Footer /></>;
}
