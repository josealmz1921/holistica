"use client";

import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebase";
import { useRouter } from "next/navigation";

export const useProtectedRoute = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let current = 0;
        const unsubscribe = onIdTokenChanged(auth, async user => {
            const version = ++current;
            setLoading(true);
            setError("");
            if (!user) {
                router.replace("/login");
                return;
            }

            try {
                const token = await user.getIdTokenResult();
                if (version !== current) return;
                if (token.claims.admin !== true) {
                    setError("Esta cuenta no tiene permisos de administrador.");
                    return;
                }
                setLoading(false);
            } catch {
                if (version === current) setError("No se pudo verificar tu sesión. Vuelve a iniciar sesión.");
            }
        });

        return () => { current++; unsubscribe(); };
    }, [router]);

    return {
        loading,
        error
    };
};
