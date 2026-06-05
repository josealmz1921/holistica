// src/firebase/services.ts

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

import { getCategoryById } from "./categories";

const SERVICES_COLLECTION = "services";

export const getServiceBySlug = async (
    slug: string
) => {
    const q = query(
        collection(db, SERVICES_COLLECTION),
        where("slug", "==", slug)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];

    const service: any = {
        id: doc.id,
        ...doc.data()
    };

    const category = service.category
        ? await getCategoryById(service.category as string)
        : null;

    return {
        ...service,
        category
    };

};

export const createService = async (
    service: any
) => {
    return addDoc(
        collection(db, SERVICES_COLLECTION),
        {
            ...service,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
    );
};

export const getServices = async () => {
    const snapshot = await getDocs(
        collection(db, SERVICES_COLLECTION)
    );

    const services = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
            const service: any = {
                id: docSnapshot.id,
                ...docSnapshot.data()
            };

            if (service.category) {
                const category = await getCategoryById(
                    service.category as string
                );

                return {
                    ...service,
                    category
                };
            }

            return service;
        })
    );

    return services;
};

export const getServiceById = async (
    id: string
) => {
    const serviceRef = doc(
        db,
        SERVICES_COLLECTION,
        id
    );

    const snapshot = await getDoc(serviceRef);

    if (!snapshot.exists()) {
        return null;
    }

    const service: any = {
        id: snapshot.id,
        ...snapshot.data()
    };

    const category = service.category
        ? await getCategoryById(service.category as string)
        : null;

    return {
        ...service,
        category
    };
};

export const updateService = async (
    id: string,
    service: any
) => {
    const serviceRef = doc(
        db,
        SERVICES_COLLECTION,
        id
    );

    await updateDoc(serviceRef, {
        ...service,
        updatedAt: serverTimestamp()
    });
};

export const deleteService = async (
    id: string
) => {
    const serviceRef = doc(
        db,
        SERVICES_COLLECTION,
        id
    );

    await deleteDoc(serviceRef);
};