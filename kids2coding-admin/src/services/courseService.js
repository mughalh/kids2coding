import { database } from '../config/firebase';
import { ref, get, set, push, remove, update } from 'firebase/database';

const COURSES_REF = 'courses';

// Get all courses
export const getAllCourses = async () => {
  try {
    const coursesRef = ref(database, COURSES_REF);
    const snapshot = await get(coursesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get single course
export const getCourseById = async (id) => {
  try {
    const courseRef = ref(database, `${COURSES_REF}/${id}`);
    const snapshot = await get(courseRef);
    
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// Add new course
export const addCourse = async (courseData) => {
  try {
    const coursesRef = ref(database, COURSES_REF);
    const newCourseRef = push(coursesRef);
    
    const course = {
      ...courseData,
      id: newCourseRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await set(newCourseRef, course);
    return course;
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
  }
};

// Update course
export const updateCourse = async (id, courseData) => {
  try {
    const courseRef = ref(database, `${COURSES_REF}/${id}`);
    
    const updates = {
      ...courseData,
      updatedAt: new Date().toISOString()
    };
    
    await update(courseRef, updates);
    return { id, ...updates };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (id) => {
  try {
    const courseRef = ref(database, `${COURSES_REF}/${id}`);
    await remove(courseRef);
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Validation helper
export const validateCourse = (courseData) => {
  const errors = {};
  
  if (!courseData.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!courseData.description?.trim()) {
    errors.description = 'Description is required';
  }
  
  if (!courseData.level) {
    errors.level = 'Level is required';
  }
  
  if (!courseData.tags || courseData.tags.length === 0) {
    errors.tags = 'At least one tag is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};