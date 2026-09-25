import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface TherapistPhoto {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

export interface TherapistProfile {
    name: string;
    specialty: string;
    description: string;
    photo: TherapistPhoto | null;
}

const therapistRef = () => doc(db, "content", "therapist");

export async function getTherapist(): Promise<TherapistProfile | null> {
    const snapshot = await getDoc(therapistRef());
    return snapshot.exists() ? snapshot.data() as TherapistProfile : null;
}

export async function saveTherapist(profile: TherapistProfile) {
    await setDoc(therapistRef(), {
        ...profile,
        updatedAt: serverTimestamp(),
    });
}
