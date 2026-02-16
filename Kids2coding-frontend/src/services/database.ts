import {
  get,
  push,
  ref,
  remove,
  set,
  update
} from "firebase/database";
import { database } from "../firebase/config";

/**
 * Generic Database Service
 * Used for collections like courses, lessons, games, etc.
 */
export const databaseService = {
  /**
   * CREATE - Add item to a collection (uses push for auto ID)
   */
  async create(collectionPath: string, data: any) {
    try {
      const collectionRef = ref(database, collectionPath);
      const newItemRef = push(collectionRef);

      const payload = {
        ...data,
        id: newItemRef.key,
        createdAt: new Date().toISOString(),
      };

      await set(newItemRef, payload);

      return payload;
    } catch (error) {
      console.error(`Error creating in ${collectionPath}:`, error);
      throw error;
    }
  },

  /**
   * READ - Get all items from a collection
   */
  async getAll(collectionPath: string) {
    try {
      const collectionRef = ref(database, collectionPath);
      const snapshot = await get(collectionRef);

      if (!snapshot.exists()) return [];

      const data = snapshot.val();

      return Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
    } catch (error) {
      console.error(`Error reading from ${collectionPath}:`, error);
      return [];
    }
  },

  /**
   * READ - Get single item by ID
   */
  async getById(collectionPath: string, id: string) {
    try {
      const itemRef = ref(database, `${collectionPath}/${id}`);
      const snapshot = await get(itemRef);

      if (!snapshot.exists()) return null;

      return {
        id,
        ...snapshot.val(),
      };
    } catch (error) {
      console.error(`Error getting ${collectionPath}/${id}:`, error);
      return null;
    }
  },

  /**
   * UPDATE - Update an existing item
   */
  async update(collectionPath: string, id: string, updates: any) {
    try {
      const itemRef = ref(database, `${collectionPath}/${id}`);

      const payload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await update(itemRef, payload);

      return { id, ...payload };
    } catch (error) {
      console.error(`Error updating ${collectionPath}/${id}:`, error);
      throw error;
    }
  },

  /**
   * DELETE - Remove an item
   */
  async delete(collectionPath: string, id: string) {
    try {
      const itemRef = ref(database, `${collectionPath}/${id}`);
      await remove(itemRef);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionPath}/${id}:`, error);
      throw error;
    }
  },

  /**
   * ===============================
   * USER-SPECIFIC METHODS (IMPORTANT)
   * ===============================
   */

  /**
   * Create user profile at users/{uid}
   * This should be used AFTER Firebase Auth signup
   */
  async createUserProfile(uid: string, data: any) {
    try {
      const userRef = ref(database, `users/${uid}`);

      const payload = {
        ...data,
        uid,
        createdAt: new Date().toISOString(),
      };

      await set(userRef, payload);

      return payload;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  },

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string) {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) return null;

      return snapshot.val();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: any) {
    try {
      const userRef = ref(database, `users/${uid}`);

      const payload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await update(userRef, payload);

      return payload;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }
};

/**
 * App Collection Constants
 */
export const collections = {
  USERS: "users",
  COURSES: "courses",
  LESSONS: "lessons",
  GAMES: "games",
  PROGRESS: "progress",
  BADGES: "badges",
};
