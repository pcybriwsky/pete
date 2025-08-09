import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const storage = getStorage(app);

// Export Firebase functions
export { httpsCallable };

// Export Firestore functions
export { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';

// Export Auth functions
export { signInAnonymously } from 'firebase/auth';

// Export Storage functions
export {
  ref as sRef,
  uploadBytes,
  getDownloadURL,
  listAll,
  list,
  getMetadata
} from 'firebase/storage'; 