import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from '../firebase/config';

// Get all courses from Firebase
export async function getCourses() {
  try {
    console.log("📡 [getCourses] Fetching from Firebase...");
    
    // Check if database is initialized
    if (!database) {
      console.error("❌ [getCourses] Database not initialized!");
      return [];
    }
    
    const coursesRef = ref(database, 'courses');
    const snapshot = await get(coursesRef);
    console.log("📡 [getCourses] Snapshot exists:", snapshot.exists());

    // 🔍 DEBUG: Check root keys to see what's in the database
    try {
      const rootRef = ref(database, '/');
      const rootSnap = await get(rootRef);
      if (rootSnap.exists()) {
        const rootKeys = Object.keys(rootSnap.val());
        console.log("📁 [getCourses] Root database keys:", rootKeys);
        
        if (rootKeys.includes('courses')) {
          console.log("✅ [getCourses] 'courses' node found at root");
        } else {
          console.warn("⚠️ [getCourses] 'courses' node NOT found at root!");
          console.log("💡 [getCourses] Available keys:", rootKeys.join(', '));
        }
      } else {
        console.log("📁 [getCourses] Root database is completely empty");
      }
    } catch (rootErr) {
      console.error("❌ [getCourses] Error checking root:", rootErr);
    }

    if (snapshot.exists()) {
      const coursesObject = snapshot.val();
      const keys = Object.keys(coursesObject);
      console.log("📡 [getCourses] Found courses with keys:", keys);
      console.log("📡 [getCourses] Number of courses:", keys.length);
      
      if (keys.length > 0) {
        // Log first course as sample
        const firstKey = keys[0];
        console.log("📡 [getCourses] Sample course data:", {
          id: firstKey,
          title: coursesObject[firstKey].title,
          level: coursesObject[firstKey].level,
          hasLessons: !!coursesObject[firstKey].lessons,
          lessonsCount: coursesObject[firstKey].lessonsCount
        });
      }
      
      // Convert to array with proper error handling
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
      
      console.log("✅ [getCourses] Successfully converted", coursesArray.length, "courses");
      return coursesArray;
    }
    
    console.log("📡 [getCourses] No data found at 'courses' path");
    return [];
  } catch (error) {
    console.error("❌ [getCourses] Error:", error);
    if (error.code) {
      console.error("❌ [getCourses] Error code:", error.code);
      console.error("❌ [getCourses] Error message:", error.message);
    }
    return [];
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
    
    // Ensure lessonsCount is calculated from lessons object if present
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
    
    // Get current data first
    const snapshot = await get(courseRef);
    if (!snapshot.exists()) {
      throw new Error('Course not found');
    }
    
    // If lessons are updated, recalculate lessonsCount
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