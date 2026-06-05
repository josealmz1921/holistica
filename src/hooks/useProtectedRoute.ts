"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebase";
import { useRouter } from "next/navigation";

export const useProtectedRoute = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {

            if (!user) {
                router.replace("/login");
                return;
            }

            setLoading(false);
        });

        return unsubscribe;
    }, [router]);

    return {
        loading
    };
};