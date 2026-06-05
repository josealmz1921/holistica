// src/firebase/auth.ts

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";

import { auth } from "./firebase";

export const login = (
    email: string,
    password: string
) => {
    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );
};

export const logout = () => {
    return signOut(auth);
};

export const subscribeToAuth = (
    callback: (user: User | null) => void
) => {
    return onAuthStateChanged(auth, callback);
};