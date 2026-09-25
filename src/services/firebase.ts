import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// User's exact Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAZaLOyIVd1M0Qz3EEAwNT0y7gSSH8wBmI",
  authDomain: "tattoo-s-world.firebaseapp.com",
  projectId: "tattoo-s-world",
  storageBucket: "tattoo-s-world.firebasestorage.app",
  messagingSenderId: "353064931634",
  appId: "1:353064931634:web:325516fdde6be2d7f0872b",
  measurementId: "G-E36D5N47GY"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable permanent local auth persistence so login stays saved across reloads
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics (safe initialization)
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

// Master Admin Emails designated by the owner
export const ADMIN_EMAILS = [
  'mm2ultimatehub@gmail.com',
  'huseynoveleddin87@gmail.com',
];

export const ADMIN_EMAIL = 'mm2ultimatehub@gmail.com';

/**
 * Checks if a given email is a designated Master Admin
 */
export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === normalized);
};
