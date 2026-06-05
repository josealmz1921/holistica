
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where
} from "firebase/firestore";

import { db } from "./firebase";

const SERVICES_COLLECTION = "categories";

export const createCategory = async (data: any) => {
    return addDoc(
        collection(db, SERVICES_COLLECTION),
        {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
    );
};

export const getCategories = async () => {
    const snapshot = await getDocs(
        collection(db, SERVICES_COLLECTION)
    );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const getCategoryById = async (
    id: string
) => {

    const docRef = doc(
        db,
        SERVICES_COLLECTION,
        id
    );

    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
};

export const updateCategory = async (
    id: string,
    data: any
) => {

    const docRef = doc(
        db,
        SERVICES_COLLECTION,
        id
    );

    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteCategory = async (
    id: string
) => {

    await deleteDoc(
        doc(db, SERVICES_COLLECTION, id)
    );
};