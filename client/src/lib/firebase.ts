import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyAwP_M_w9jUgjZUBGsCd84QYIwxiK9QGRc",
  authDomain: "customer-services-platform.firebaseapp.com",
  projectId: "customer-services-platform",
  storageBucket: "customer-services-platform.firebasestorage.app",
  messagingSenderId: "985423513184",
  appId: "1:985423513184:web:d98bd7479604f79b652505",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Enable browserLocalPersistence
try {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} catch {}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

