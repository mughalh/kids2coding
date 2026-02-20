import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCQBF47kQr2hVxKv5kXSevAqueb8cwHqGI",
  authDomain: "cosmicflow-gby1b.firebaseapp.com",
  databaseURL: "https://cosmicflow-gby1b-default-rtdb.firebaseio.com",
  projectId: "cosmicflow-gby1b",
  storageBucket: "cosmicflow-gby1b.firebasestorage.app",
  messagingSenderId: "25616866316",
  appId: "1:25616866316:web:da37f68eaf1c8cad5ee229"
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


console.log('🔥 Firebase connected to project:', firebaseConfig.projectId);
console.log('🔥 Database URL:', firebaseConfig.databaseURL);


export default app;