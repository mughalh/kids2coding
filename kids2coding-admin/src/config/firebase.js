import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Admin email (only one admin)
export const ADMIN_EMAIL = "admin@kids2coding.com";

export default app;