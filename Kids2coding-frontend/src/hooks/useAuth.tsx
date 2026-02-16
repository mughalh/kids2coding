import NetInfo from "@react-native-community/netinfo";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { get, getDatabase, ref, set, update } from "firebase/database";
import { useEffect, useState } from "react";

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDs5CfZJPabJH8AyC5x0hg-ra3Ula1Ucso",
  authDomain: "ids2coding.firebaseapp.com", // Replace with yours
  projectId: "ids2coding", // Replace with yours
  databaseURL: "https://ids2coding-default-rtdb.firebaseio.com/", // Replace with yours
  storageBucket: "kids-2-coding.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:123456789",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);
// -------------------------------

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.exists() ? snapshot.val() : {};
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName:
              firebaseUser.displayName || userData.displayName || "Coder Kid",
            ...userData,
          });
        } catch (error) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getErrorMessage = (error: any): string => {
    if (!isOnline) return "No internet connection.";
    if (!error) return "An unknown error occurred.";

    switch (error.code) {
      case "auth/invalid-credential":
        return "Wrong email or password.";
      case "auth/email-already-in-use":
        return "Email already registered.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/user-not-found":
        return "User not found.";
      default:
        return error.message || "Action failed.";
    }
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName });
      await set(ref(database, `users/${res.user.uid}`), {
        uid: res.user.uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await update(ref(database, `users/${res.user.uid}`), {
        lastLogin: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout: () => signOut(auth),
  };
}
