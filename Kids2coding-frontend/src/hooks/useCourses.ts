import { useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, onValue } from 'firebase/database';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  emoji?: string;
  duration?: string;
  lessonsCount?: number;
  imageUrl?: string;
  color?: string;
  bgColor?: string;
  lessons?: number;
  progress?: number;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const coursesRef = ref(database, 'courses');

    const unsubscribe = onValue(
      coursesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert object to array
          const coursesArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setCourses(coursesArray);
        } else {
          setCourses([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching courses:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getCourseById = (courseId: string): Course | undefined => {
    return courses.find((course) => course.id === courseId);
  };

  const getTotalLessonsCount = (): number => {
    return courses.reduce((total, course) => total + (course.lessonsCount || 0), 0);
  };

  return {
    courses,
    loading,
    error,
    getCourseById,
    getTotalLessonsCount,
  };
}