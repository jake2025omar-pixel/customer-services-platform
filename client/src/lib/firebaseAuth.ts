import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

let authInstance: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

export function getFirebaseAuth(): { auth: Auth | null; provider: GoogleAuthProvider | null } {
  if (authInstance && googleProviderInstance) {
    return { auth: authInstance, provider: googleProviderInstance };
  }

  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      authInstance = getAuth(app);
      googleProviderInstance = new GoogleAuthProvider();
      googleProviderInstance.setCustomParameters({ prompt: "select_account" });
      return { auth: authInstance, provider: googleProviderInstance };
    } catch (err) {
      console.warn("[Firebase] Initialization error:", err);
    }
  }

  return { auth: null, provider: null };
}

export type GoogleLoginPayload = {
  email: string;
  name: string;
  photoUrl?: string;
  openId?: string;
  idToken?: string;
};

export async function sendGoogleLoginToBackend(payload: GoogleLoginPayload) {
  const response = await fetch("/api/auth/google-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to authenticate Google account on server");
  }

  if (data.cookieString) {
    try {
      sessionStorage.setItem("manus-cookie", data.cookieString);
    } catch (e) {
      // Ignore storage errors in restricted contexts
    }
  }

  return data;
}

/**
 * Direct Google login triggered from a button click.
 * If Firebase is configured with API keys, calls signInWithPopup immediately.
 * Otherwise triggers Google Account Chooser dialog so user can select their Google account.
 */
export async function triggerGoogleSignIn(onFallbackNeeded?: (reason: string) => void): Promise<boolean> {
  const { auth, provider } = getFirebaseAuth();

  if (auth && provider) {
    try {
      // Must be called directly on user click
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      await sendGoogleLoginToBackend({
        email: user.email || "user@gmail.com",
        name: user.displayName || user.email?.split("@")[0] || "Google Member",
        photoUrl: user.photoURL || undefined,
        openId: `google_${user.uid}`,
        idToken,
      });

      window.location.replace("/");
      return true;
    } catch (error: any) {
      console.warn("[Firebase] Popup error or configuration issue:", error);
      if (onFallbackNeeded) {
        onFallbackNeeded(error?.code || error?.message || "Firebase popup restricted");
        return false;
      }
    }
  }

  // If Firebase keys aren't set in environment, or if popup was blocked/unauthorized domain
  if (onFallbackNeeded) {
    onFallbackNeeded("Firebase credentials not configured or domain restricted. Please select your Google account below.");
    return false;
  }

  // Direct demo fallback
  window.location.href = "/api/oauth/demo-login";
  return true;
}
