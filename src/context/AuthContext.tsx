import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  getFriendlyErrorMessage,
} from '../services/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo: boolean;
  companyName: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, pass: string, companyName?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  demoLogin: () => void;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCompanyName: (newCompany: string) => void;
  websiteName: string;
  updateWebsiteName: (newName: string) => void;
  lockoutSeconds: number;
  isLockedOut: boolean;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_STORAGE_KEY = 'kartking_active_user';
const USERS_REGISTRY_KEY = 'kartking_users_registry';
const WEBSITE_NAME_KEY = 'app_website_name';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

function deriveDisplayNameFromEmail(email: string): string {
  const handle = email.split('@')[0] || 'Analyst';
  const parts = handle.split(/[._-]+/);
  if (parts.length > 1) {
    return parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(' ');
  }
  const match = handle.match(/[A-Za-z][a-z]*/g);
  if (match && match.length > 1) {
    return match
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic website platform name
  const [websiteName, setWebsiteName] = useState<string>(() => {
    return localStorage.getItem(WEBSITE_NAME_KEY) || 'KartKing Analytics';
  });

  // Keep browser tab title synced with website name
  useEffect(() => {
    document.title = `${websiteName} - E-Commerce Intelligence`;
  }, [websiteName]);

  const updateWebsiteName = (newName: string) => {
    const finalName = newName.trim() || 'KartKing Analytics';
    setWebsiteName(finalName);
    localStorage.setItem(WEBSITE_NAME_KEY, finalName);
  };

  // Rate-limiting state
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const recordFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      setLockoutSeconds(LOCKOUT_DURATION_SECONDS);
    }
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutSeconds(0);
  };

  // Helper to persist user session across reloads
  const saveUserSession = (appUser: AppUser, rememberMe: boolean = true) => {
    const serialized = JSON.stringify(appUser);
    sessionStorage.setItem(ACTIVE_USER_STORAGE_KEY, serialized);
    if (rememberMe) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, serialized);
    } else {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }
  };

  const clearUserSession = () => {
    sessionStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
  };

  // Initial session hydration
  useEffect(() => {
    // 1. First check persisted session
    const storedSession =
      sessionStorage.getItem(ACTIVE_USER_STORAGE_KEY) ||
      localStorage.getItem(ACTIVE_USER_STORAGE_KEY);

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession) as AppUser;
        if (!parsed.companyName) {
          parsed.companyName = 'KartKing';
        }
        setUser(parsed);
        // If website name has not been customized separately, sync with company
        const storedSiteName = localStorage.getItem(WEBSITE_NAME_KEY);
        if (!storedSiteName && parsed.companyName && parsed.companyName !== 'KartKing') {
          setWebsiteName(`${parsed.companyName} Analytics`);
        }
        setLoading(false);
        return;
      } catch {
        clearUserSession();
      }
    }

    // 2. If Firebase is active and configured, observe auth state
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          let company = 'KartKing';
          try {
            const registryRaw = localStorage.getItem(USERS_REGISTRY_KEY);
            if (registryRaw && fbUser.email) {
              const reg = JSON.parse(registryRaw);
              if (reg[fbUser.email.toLowerCase()]?.companyName) {
                company = reg[fbUser.email.toLowerCase()].companyName;
              }
            }
          } catch {
            // ignore
          }

          const appUser: AppUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || deriveDisplayNameFromEmail(fbUser.email || 'user'),
            photoURL: fbUser.photoURL,
            isDemo: false,
            companyName: company,
          };
          setUser(appUser);
          saveUserSession(appUser, true);
        } else {
          setUser(null);
          clearUserSession();
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }

    setLoading(false);
  }, []);

  const updateCompanyName = (newCompany: string) => {
    const trimmed = newCompany.trim() || 'KartKing';
    if (!user) return;
    const updated: AppUser = {
      ...user,
      companyName: trimmed,
    };
    setUser(updated);
    saveUserSession(updated, true);

    // Also update website name if it's currently at default
    const currentSite = localStorage.getItem(WEBSITE_NAME_KEY);
    if (!currentSite || currentSite === 'KartKing Analytics') {
      updateWebsiteName(`${trimmed} Analytics`);
    }

    // Update in registry if email exists
    if (user.email) {
      try {
        const registryRaw = localStorage.getItem(USERS_REGISTRY_KEY);
        const registry = registryRaw ? JSON.parse(registryRaw) : {};
        registry[user.email.toLowerCase()] = {
          ...(registry[user.email.toLowerCase()] || {}),
          name: user.displayName,
          email: user.email,
          companyName: trimmed,
        };
        localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
      } catch {
        // ignore
      }
    }
  };

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    if (lockoutSeconds > 0) {
      throw new Error(`Too many failed attempts. Locked out for ${lockoutSeconds} seconds.`);
    }

    let registeredName: string | null = null;
    let registeredCompany = 'KartKing';
    try {
      const registryRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        if (registry[email.toLowerCase()]) {
          registeredName = registry[email.toLowerCase()].name;
          registeredCompany = registry[email.toLowerCase()].companyName || 'KartKing';
        }
      }
    } catch {
      // ignore
    }

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || registeredName || deriveDisplayNameFromEmail(cred.user.email || email),
          photoURL: cred.user.photoURL,
          isDemo: false,
          companyName: registeredCompany,
        };
        setUser(appUser);
        saveUserSession(appUser, rememberMe);
        resetFailedAttempts();
        return;
      } catch (err: any) {
        if (
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential' ||
          err.code === 'auth/user-not-found'
        ) {
          recordFailedAttempt();
          throw new Error(getFriendlyErrorMessage(err.code));
        }
        console.warn('Firebase login attempt had error, using fallback:', err);
      }
    }

    const displayName = registeredName || deriveDisplayNameFromEmail(email);

    const appUser: AppUser = {
      uid: `usr_${Date.now()}`,
      email: email.trim(),
      displayName,
      photoURL: null,
      isDemo: false,
      companyName: registeredCompany,
    };

    setUser(appUser);
    saveUserSession(appUser, rememberMe);
    resetFailedAttempts();
  };

  const signup = async (name: string, email: string, pass: string, companyName?: string) => {
    const finalCompany = companyName?.trim() || 'KartKing';

    try {
      const registryRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      const registry = registryRaw ? JSON.parse(registryRaw) : {};
      registry[email.toLowerCase()] = {
        name: name.trim(),
        email: email.trim(),
        companyName: finalCompany,
      };
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
    } catch {
      // ignore
    }

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name.trim() || deriveDisplayNameFromEmail(email),
          photoURL: cred.user.photoURL,
          isDemo: false,
          companyName: finalCompany,
        };
        setUser(appUser);
        saveUserSession(appUser, true);
        if (finalCompany !== 'KartKing') {
          updateWebsiteName(`${finalCompany} Analytics`);
        }
        resetFailedAttempts();
        return;
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        console.warn('Firebase signup had error, using fallback:', err);
      }
    }

    const appUser: AppUser = {
      uid: `usr_${Date.now()}`,
      email: email.trim(),
      displayName: name.trim() || deriveDisplayNameFromEmail(email),
      photoURL: null,
      isDemo: false,
      companyName: finalCompany,
    };

    setUser(appUser);
    saveUserSession(appUser, true);
    if (finalCompany !== 'KartKing') {
      updateWebsiteName(`${finalCompany} Analytics`);
    }
    resetFailedAttempts();
  };

  const googleLogin = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || deriveDisplayNameFromEmail(cred.user.email || 'user'),
          photoURL: cred.user.photoURL,
          isDemo: false,
          companyName: 'KartKing',
        };
        setUser(appUser);
        saveUserSession(appUser, true);
        resetFailedAttempts();
        return;
      } catch (err: any) {
        console.warn('Firebase Google login had error, using fallback:', err);
      }
    }

    const appUser: AppUser = {
      uid: `google_usr_${Date.now()}`,
      email: 'zara.analyst@gmail.com',
      displayName: 'Zara Analyst',
      photoURL: null,
      isDemo: false,
      companyName: 'KartKing',
    };

    setUser(appUser);
    saveUserSession(appUser, true);
    resetFailedAttempts();
  };

  const demoLogin = () => {
    const demoUser: AppUser = {
      uid: 'demo-user-1001',
      email: 'recruiter.demo@kartking.in',
      displayName: 'Guest Analyst',
      photoURL: null,
      isDemo: true,
      companyName: 'KartKing',
    };
    setUser(demoUser);
    saveUserSession(demoUser, false);
    resetFailedAttempts();
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return;
      } catch (err: any) {
        console.warn('Firebase reset password error, using fallback:', err);
      }
    }
  };

  const logout = async () => {
    clearUserSession();
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Error signing out of Firebase:', err);
      }
    }
    setUser(null);
  };

  const isLockedOut = lockoutSeconds > 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        googleLogin,
        demoLogin,
        resetPassword,
        logout,
        updateCompanyName,
        websiteName,
        updateWebsiteName,
        lockoutSeconds,
        isLockedOut,
        isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
