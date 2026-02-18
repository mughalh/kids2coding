import { useState, useEffect } from 'react';
import { auth, database } from '../firebase/config';
import { ref, onValue, set, update, get } from 'firebase/database';

export function useProgress() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserId = () => {
    return auth.currentUser?.uid;
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    const progressRef = ref(database, `users/${userId}/progress`);
    
    // Real-time listener
    const unsubscribe = onValue(progressRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          setProgress(snapshot.val());
        } else {
          // Create initial progress document
          const initialProgress = {
            enrolledCourses: [],
            completedLessons: {},
            quizScores: {},
            earnedBadges: [],
            totalXP: 0,
            streak: 0,
            lastActive: new Date().toISOString(),
          };
          
          // Save to Realtime Database
          set(progressRef, initialProgress)
            .then(() => {
              setProgress(initialProgress);
            })
            .catch((err) => {
              console.error('Error creating progress:', err);
              setError(err.message);
            });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Progress listener error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate progress percentage for a course
  const getCourseProgress = (courseId: string, totalLessons: number): number => {
    if (!progress?.completedLessons?.[courseId]) return 0;
    
    const completedCount = progress.completedLessons[courseId].length || 0;
    return Math.min(Math.round((completedCount / totalLessons) * 100), 100);
  };

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: string): boolean => {
    return progress?.enrolledCourses?.includes(courseId) || false;
  };

  // Check if a specific lesson is completed
  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    return progress?.completedLessons?.[courseId]?.includes(lessonId) || false;
  };

  // Get quiz score for a specific quiz
  const getQuizScore = (courseId: string, quizId: string) => {
    return progress?.quizScores?.[courseId]?.[quizId] || null;
  };

  const completeLesson = async (courseId: string, lessonId: string) => {
    try {
      const userId = getUserId();
      if (!userId || !progress) return;

      const progressRef = ref(database, `users/${userId}/progress`);
      
      // Check if already completed
      if (progress.completedLessons?.[courseId]?.includes(lessonId)) {
        return; // Already completed
      }

      // Prepare updates
      const updates: any = {
        lastActive: new Date().toISOString(),
        totalXP: (progress.totalXP || 0) + 10,
      };

      // Update completed lessons
      if (!progress.completedLessons) {
        updates.completedLessons = { [courseId]: [lessonId] };
      } else if (!progress.completedLessons[courseId]) {
        updates[`completedLessons/${courseId}`] = [lessonId];
      } else {
        updates[`completedLessons/${courseId}`] = [
          ...progress.completedLessons[courseId],
          lessonId
        ];
      }

      // Update streak
      const today = new Date().toDateString();
      const lastActive = progress.lastActive 
        ? new Date(progress.lastActive).toDateString() 
        : null;
      
      if (lastActive && lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive === yesterday.toDateString()) {
          // Consecutive day
          updates.streak = (progress.streak || 0) + 1;
        } else {
          // Streak broken
          updates.streak = 1;
        }
      } else if (!lastActive) {
        updates.streak = 1;
      }

      await update(progressRef, updates);
      
      // Update local state
      setProgress((prev: any) => ({
        ...prev,
        ...updates,
        completedLessons: {
          ...prev?.completedLessons,
          [courseId]: updates[`completedLessons/${courseId}`] || prev?.completedLessons?.[courseId]
        }
      }));

      return { success: true };
    } catch (err: any) {
      console.error('Error completing lesson:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const saveQuizResult = async (courseId: string, quizId: string, score: number, totalQuestions: number) => {
    try {
      const userId = getUserId();
      if (!userId || !progress) return;

      const progressRef = ref(database, `users/${userId}/progress`);
      
      // Calculate XP earned (max 20 XP per quiz)
      const xpEarned = Math.round((score / totalQuestions) * 20);
      
      const updates: any = {
        lastActive: new Date().toISOString(),
        totalXP: (progress.totalXP || 0) + xpEarned,
        [`quizScores/${courseId}/${quizId}`]: { 
          score, 
          total: totalQuestions, 
          date: new Date().toISOString() 
        }
      };

      await update(progressRef, updates);
      
      // Update local state
      setProgress((prev: any) => ({
        ...prev,
        ...updates
      }));

      return { success: true, xpEarned };
    } catch (err: any) {
      console.error('Error saving quiz result:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const userId = getUserId();
      if (!userId || !progress) return;

      const progressRef = ref(database, `users/${userId}/progress`);
      
      // Check if already enrolled
      if (progress.enrolledCourses?.includes(courseId)) {
        return { success: true, message: 'Already enrolled' };
      }

      const updates: any = {
        lastActive: new Date().toISOString(),
        enrolledCourses: [...(progress.enrolledCourses || []), courseId]
      };

      await update(progressRef, updates);
      
      // Update local state
      setProgress((prev: any) => ({
        ...prev,
        ...updates
      }));

      return { success: true };
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const earnBadge = async (badgeId: string) => {
    try {
      const userId = getUserId();
      if (!userId || !progress) return;

      const progressRef = ref(database, `users/${userId}/progress`);
      
      // Check if badge already earned
      if (progress.earnedBadges?.includes(badgeId)) {
        return { success: true, message: 'Badge already earned' };
      }

      const updates: any = {
        lastActive: new Date().toISOString(),
        totalXP: (progress.totalXP || 0) + 50,
        earnedBadges: [...(progress.earnedBadges || []), badgeId]
      };

      await update(progressRef, updates);
      
      // Update local state
      setProgress((prev: any) => ({
        ...prev,
        ...updates
      }));

      return { success: true };
    } catch (err: any) {
      console.error('Error earning badge:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Get user's level based on XP
  const getUserLevel = (): number => {
    if (!progress?.totalXP) return 1;
    return Math.floor(progress.totalXP / 100) + 1;
  };

  // Get progress to next level
  const getLevelProgress = (): number => {
    if (!progress?.totalXP) return 0;
    const xpInCurrentLevel = progress.totalXP % 100;
    return Math.floor((xpInCurrentLevel / 100) * 100);
  };

  return {
    progress,
    loading,
    error,
    getCourseProgress,
    isEnrolled,
    isLessonCompleted,
    getQuizScore,
    getUserLevel,
    getLevelProgress,
    completeLesson,
    saveQuizResult,
    enrollInCourse,
    earnBadge,
  };
}