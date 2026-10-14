import "server-only";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function adminApp() {
    const existing = getApps().find(app => app.name === "holistica-admin");
    if (existing) return existing;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId) throw new Error("Firebase Admin project is not configured");
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && projectId !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) throw new Error("Firebase Admin and client projects must match");
    if (Boolean(clientEmail) !== Boolean(privateKey)) throw new Error("Incomplete Firebase Admin credentials");
    return initializeApp({
        projectId,
        credential: clientEmail && privateKey ? cert({ projectId, clientEmail, privateKey }) : applicationDefault(),
    }, "holistica-admin");
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
