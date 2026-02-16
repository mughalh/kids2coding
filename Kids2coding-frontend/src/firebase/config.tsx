import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDs5CfZJPabJH8AyC5x0hg-ra3Ula1Ucso",
  authDomain: "ids2coding.firebaseapp.com",
  projectId: "ids2coding",
  databaseURL: "https://ids2coding-default-rtdb.firebaseio.com/",
  storageBucket: "ids2coding.appspot.com", // Fixed: should match project ID
  messagingSenderId: "123456789",
  appId: "1:123456789:web:123456789"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);

// Optional: Enable persistence for better offline support
// import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
// enableIndexedDbPersistence(getFirestore(app)).catch((err) => {
//   console.log('Persistence failed:', err.code);
// });

// Export collection names as constants for consistency
export const Collections = {
  USERS: 'users',
  COURSES: 'courses',
  LESSONS: 'lessons',
  PROGRESS: 'progress',
  QUIZZES: 'quizzes',
  BADGES: 'badges',
  CHALLENGES: 'challenges'
} as const;

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!app && !!auth && !!database;
};

// Log initialization status (helpful for debugging)
console.log('🔥 Firebase initialized:', {
  app: !!app,
  auth: !!auth,
  database: !!database,
  projectId: firebaseConfig.projectId
});

export default app;