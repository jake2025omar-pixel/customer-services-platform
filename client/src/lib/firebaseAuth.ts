import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwP_M_w9jUgjZUBGsCd84QYIwxiK9QGRc",
  authDomain: "customer-services-platform.firebaseapp.com",
  projectId: "customer-services-platform",
  storageBucket: "customer-services-platform.firebasestorage.app",
  messagingSenderId: "985423513184",
  appId: "1:985423513184:web:d98bd7479604f79b652505",
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
  // Always persist local user object for static hosting (e.g. GitHub Pages)
  const localUserData = {
    id: 1,
    openId: payload.openId || `google_${payload.email}`,
    name: payload.name,
    email: payload.email,
    role: payload.email.toLowerCase().includes("jake") || payload.email.toLowerCase().includes("hatkook") ? "admin" : "user",
    pointsBalance: 100,
    avatarUrl: payload.photoUrl,
  };
  try {
    localStorage.setItem("gh_pages_user", JSON.stringify(localUserData));
    localStorage.setItem("manus-runtime-user-info", JSON.stringify(localUserData));
  } catch (e) {
    // Ignore storage restrictions
  }

  try {
    const response = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.warn("[Auth] Server auth response not ok:", data.error);
    }

    if (data?.cookieString) {
      try {
        sessionStorage.setItem("manus-cookie", data.cookieString);
      } catch (e) {
        // Ignore storage errors in restricted contexts
      }
    }

    return data;
  } catch (err) {
    // On static hosts like GitHub Pages, fetch to /api/ fails; localUserData already saved above
    console.info("[Auth] Static host mode active - saved user credentials locally:", err);
    return { ok: true, user: localUserData };
  }
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
