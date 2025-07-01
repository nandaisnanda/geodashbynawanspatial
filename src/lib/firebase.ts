
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  // These are placeholder values - users would need to add their own Firebase config
  apiKey: "demo-key",
  authDomain: "geodash-demo.firebaseapp.com",
  projectId: "geodash-demo",
  storageBucket: "geodash-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize anonymous authentication
export const initializeAuth = async () => {
  try {
    await signInAnonymously(auth);
    console.log('Anonymous authentication successful');
  } catch (error) {
    console.log('Demo mode - Firebase not configured');
  }
};
