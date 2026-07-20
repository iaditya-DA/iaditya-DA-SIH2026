import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { watchAuthState, getAuthToken, db } from "./firebaseClient.js";

const AuthContext = createContext(null);

const ADMIN_EMAILS = ['admin@gmail.com'];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false;

    const checkRegistration = async (firebaseUser) => {
        if (!firebaseUser) {
            setIsRegistered(false);
            return;
        }
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setIsRegistered(snap.exists() && snap.data().registered === true);
    };

    useEffect(() => {
        const unsubscribe = watchAuthState(async (firebaseUser) => {
            setUser(firebaseUser);
            await checkRegistration(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const refreshRegistration = () => checkRegistration(user);

    return (
        <AuthContext.Provider value={{ user, loading, isRegistered, isAdmin, refreshRegistration, getAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}