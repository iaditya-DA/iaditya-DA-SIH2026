import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDlTyJcEgO6r_9y0JjmsNE8O6MIIaTBspg',
    authDomain: 'sih2026-b5f06.firebaseapp.com',
    projectId: 'sih2026-b5f06',
    storageBucket: 'sih2026-b5f06.firebasestorage.app',
    messagingSenderId: '237832494472',
    appId: '1:237832494472:web:53457fb282fb4f4d676e3d',
    measurementId: 'G-78SSKV4FL9',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ================= SIGNUP =================
export async function signUpAndRegister(userData) {
    const { email, password, name, year, branch } = userData;

    // Firebase account
    const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = result.user;

    // Firestore profile
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        name,
        year,
        branch,
        role: 'individual',
        skills: [],
        createdAt: serverTimestamp()
    });

    return user;
}

// ================= LOGIN =================
export async function login(email, password) {
    const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return result.user;
}

// ================= LOGOUT =================
export async function logout() {
    await signOut(auth);
}

// ================= PROFILE =================
export async function getCurrentUserProfile() {
    const user = auth.currentUser;

    if (!user) return null;

    const snap = await getDoc(doc(db, 'users', user.uid));

    return snap.exists() ? snap.data() : null;
}

// ================= AUTH STATE =================
export async function getAuthToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
}

// ================= AUTH STATE LISTENER =================
export function watchAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}