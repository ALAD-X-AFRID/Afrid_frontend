"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export type Language = {
  language: string;
  dialect: string;
  proficiency_level: string;
};

export type ContributorMetadata = {
  country: string;
  tribe: string;
  age_range: string;
  region: string;
  languages: Language[];
};

type AuthState = {
  user: User | null;
  idToken: string | null;
  metadata: ContributorMetadata;
  setMetadata: (m: Partial<ContributorMetadata>) => void;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, profileData?: Record<string, string | boolean | Array<{ language: string; dialect: string; proficiency_level: string }>>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const defaultMetadata: ContributorMetadata = {
  country: "",
  tribe: "",
  age_range: "",
  region: "",
  languages: [],
};

const AuthContext = createContext<AuthState>({
  user: null,
  idToken: null,
  metadata: defaultMetadata,
  setMetadata: () => {},
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [metadata, setMetadataState] = useState<ContributorMetadata>(defaultMetadata);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch {
          setIdToken(null);
        }
      } else {
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string, profileData?: Record<string, string | boolean | Array<{ language: string; dialect: string; proficiency_level: string }>>) => {
      if (!auth) throw new Error("Auth not initialized");
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }
      if (profileData) {
        const enrichedProfileData = { ...profileData, uid: credential.user.uid };
        try {
          const token = await credential.user.getIdToken();
          const { saveProfile } = await import("@/lib/api");
          await saveProfile(token, enrichedProfileData);
        } catch (e) {
          console.warn("Failed to save profile data after signup:", e);
        }
        try {
          if (db) {
            const languages = Array.isArray(profileData.languages) ? profileData.languages : [];
            await setDoc(doc(db, "users", credential.user.uid), {
              uid: credential.user.uid,
              email: credential.user.email || (typeof profileData.email === "string" ? profileData.email : "") || "",
              displayName,
              firstname: typeof profileData.firstname === "string" ? profileData.firstname : "",
              lastname: typeof profileData.lastname === "string" ? profileData.lastname : "",
              username: typeof profileData.username === "string" ? profileData.username : "",
              phone: typeof profileData.phone === "string" ? profileData.phone : "",
              country: typeof profileData.country === "string" ? profileData.country : "",
              ageRange: typeof profileData.age_range === "string" ? profileData.age_range : "",
              occupation: typeof profileData.occupation_institution === "string" ? profileData.occupation_institution : "",
              linguistic_profile: {
                languages: languages,
              },
              createdAt: serverTimestamp(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn("Failed to save user record to Firestore:", e);
        }
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Auth not initialized");
    const result = await signInWithPopup(auth, googleProvider);
    const currentUser = result.user;
    try {
      if (db && currentUser) {
        await setDoc(doc(db, "users", currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || "",
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Failed to save Google user record to Firestore:", e);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
    setIdToken(null);
    setMetadataState(defaultMetadata);
  }, []);

  const setMetadata = useCallback((partial: Partial<ContributorMetadata>) => {
    setMetadataState((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        metadata,
        setMetadata,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useMetadata() {
  return useContext(AuthContext);
}
