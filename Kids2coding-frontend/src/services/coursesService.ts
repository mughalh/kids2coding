import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from '../firebase/config';

// Get all courses from Firebase
export async function getCourses() {
  try {
    console.log("📡 [getCourses] Fetching from Firebase...");
    
    if (!database) {
      console.error("❌ [getCourses] Database not initialized!");
      return [];
    }
    
    const coursesRef = ref(database, 'courses');
    const snapshot = await get(coursesRef);
    console.log("📡 [getCourses] Snapshot exists:", snapshot.exists());

    if (snapshot.exists()) {
      const coursesObject = snapshot.val();
      const keys = Object.keys(coursesObject);
      console.log("📡 [getCourses] Found courses with keys:", keys);
      
      const coursesArray = keys.map(key => {
        const course = coursesObject[key];
        return {
          id: key,
          title: course.title || 'Untitled',
          description: course.description || '',
          level: course.level || 'beginner',
          tags: Array.isArray(course.tags) ? course.tags : [],
          emoji: course.emoji || '📚',
          duration: course.duration || '',
          lessonsCount: course.lessonsCount || 0,
          lessons: course.lessons || {},
          quizzes: course.quizzes || {},
          color: course.color || '#4F46E5',
          bgColor: course.bgColor || '#F3F4F6',
          createdAt: course.createdAt || '',
          updatedAt: course.updatedAt || ''
        };
      });
      
      console.log("✅ [getCourses] Loaded", coursesArray.length, "courses");
      return coursesArray;
    }
    
    console.log("📡 [getCourses] No courses found");
    return [];
  } catch (error) {
    console.error("❌ [getCourses] Error:", error);
    return [];
  }
}

// Get single course by ID
export async function getCourseById(id) {
  try {
    console.log(`📡 [getCourseById] Fetching course: ${id}`);
    
    if (!database) {
      console.error("❌ [getCourseById] Database not initialized!");
      return null;
    }
    
    const courseRef = ref(database, `courses/${id}`);
    const snapshot = await get(courseRef);
    
    if (snapshot.exists()) {
      const course = snapshot.val();
      console.log(`✅ [getCourseById] Found:`, course.title);
      return {
        id,
        title: course.title || '',
        description: course.description || '',
        level: course.level || 'beginner',
        tags: course.tags || [],
        emoji: course.emoji || '📚',
        duration: course.duration || '',
        lessonsCount: course.lessonsCount || 0,
        lessons: course.lessons || {},
        quizzes: course.quizzes || {},
        color: course.color || '#4F46E5',
        bgColor: course.bgColor || '#F3F4F6',
        ...course
      };
    }
    
    console.log(`📡 [getCourseById] Course not found: ${id}`);
    return null;
  } catch (error) {
    console.error(`❌ [getCourseById] Error:`, error);
    return null;
  }
}

// Add a new course
export async function addCourse(courseData) {
  try {
    console.log("📡 [addCourse] Adding new course:", courseData.title);
    
    if (!database) {
      throw new Error("Database not initialized");
    }
    
    const coursesRef = ref(database, 'courses');
    const newCourseRef = push(coursesRef);
    
    let lessonsCount = courseData.lessonsCount || 0;
    if (courseData.lessons && Object.keys(courseData.lessons).length > 0) {
      lessonsCount = Object.keys(courseData.lessons).length;
    }
    
    const course = {
      title: courseData.title || '',
      description: courseData.description || '',
      level: courseData.level || 'beginner',
      tags: courseData.tags || [],
      emoji: courseData.emoji || '📚',
      duration: courseData.duration || '',
      lessonsCount: lessonsCount,
      lessons: courseData.lessons || {},
      quizzes: courseData.quizzes || {},
      color: courseData.color || '#4F46E5',
      bgColor: courseData.bgColor || '#F3F4F6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await set(newCourseRef, course);
    console.log("✅ [addCourse] Course added with ID:", newCourseRef.key);
    
    return { id: newCourseRef.key, ...course };
  } catch (error) {
    console.error("❌ [addCourse] Error:", error);
    throw error;
  }
}

// Update a course
export async function updateCourse(id, updates) {
  try {
    console.log(`📡 [updateCourse] Updating course: ${id}`);
    
    if (!database) {
      throw new Error("Database not initialized");
    }
    
    const courseRef = ref(database, `courses/${id}`);
    const snapshot = await get(courseRef);
    if (!snapshot.exists()) {
      throw new Error('Course not found');
    }
    
    let finalUpdates = { ...updates };
    if (updates.lessons) {
      finalUpdates.lessonsCount = Object.keys(updates.lessons).length;
    }
    
    finalUpdates.updatedAt = new Date().toISOString();
    
    await update(courseRef, finalUpdates);
    console.log("✅ [updateCourse] Course updated");
    
    return true;
  } catch (error) {
    console.error("❌ [updateCourse] Error:", error);
    throw error;
  }
}

// Delete a course
export async function deleteCourse(id) {
  try {
    console.log(`📡 [deleteCourse] Deleting course: ${id}`);
    
    if (!database) {
      throw new Error("Database not initialized");
    }
    
    const courseRef = ref(database, `courses/${id}`);
    await remove(courseRef);
    console.log("✅ [deleteCourse] Course deleted");
    return true;
  } catch (error) {
    console.error("❌ [deleteCourse] Error:", error);
    throw error;
  }
}

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