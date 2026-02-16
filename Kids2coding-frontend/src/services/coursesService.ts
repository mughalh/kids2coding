import { get, push, ref, set } from 'firebase/database';
import { database } from '../firebase/config';

// Get all courses from Firebase
export async function getCourses() {
  try {
    const coursesRef = ref(database, 'courses');
    const snapshot = await get(coursesRef);
    
    if (snapshot.exists()) {
      const coursesObject = snapshot.val();
      // Convert to array
      return Object.keys(coursesObject).map(key => ({
        id: key,
        ...coursesObject[key]
      }));
    }
    return []; // No courses yet
  } catch (error) {
    console.error("Error getting courses:", error);
    return [];
  }
}

// Add a new course
export async function addCourse(courseData) {
  try {
    const coursesRef = ref(database, 'courses');
    const newCourseRef = push(coursesRef);
    
    await set(newCourseRef, {
      ...courseData,
      id: newCourseRef.key,
      createdAt: new Date().toISOString()
    });
    
    return { id: newCourseRef.key, ...courseData };
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
}

// Update a course
export async function updateCourse(courseId, updates) {
  try {
    const courseRef = ref(database, `courses/${courseId}`);
    
    // Get current data first
    const snapshot = await get(courseRef);
    if (!snapshot.exists()) {
      throw new Error('Course not found');
    }
    
    await set(courseRef, {
      ...snapshot.val(),
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}