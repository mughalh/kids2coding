import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebase/config';

// Admin credentials (you can change these)
const ADMIN_EMAILS = ['admin@kids2coding.com']; // Add your admin emails here

// Check if user is admin
export async function isAdminUser(email) {
  return ADMIN_EMAILS.includes(email);
}

// Create admin user (run this once to set up first admin)
export async function createAdminUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save admin info to database
    const adminRef = ref(database, `admins/${userCredential.user.uid}`);
    await set(adminRef, {
      email: email,
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { success: false, error: error.message };
  }
}

// Sign in admin
export async function signInAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is admin
    const isAdmin = await isAdminUser(email);
    if (!isAdmin) {
      await signOut(auth);
      return { success: false, error: "Not authorized as admin" };
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error signing in admin:", error);
    return { success: false, error: error.message };
  }
}

// Sign out admin
export async function signOutAdmin() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error: error.message };
  }
}

// Get current admin
export function getCurrentAdmin() {
  return auth.currentUser;
}

// Listen to auth state
export function onAdminAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Check if current user is admin
export async function checkIsAdmin() {
  const user = auth.currentUser;
  if (!user || !user.email) return false;
  
  return await isAdminUser(user.email);
}