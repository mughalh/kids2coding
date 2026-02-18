import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { AppText } from "../../../../src/components/AppText";
import { ScreenWrapper } from "../../../../src/components/ScreenWrapper";
import { Colors } from "../../../../src/constants/colors";
import { Play, ChevronLeft, ChevronRight, Bookmark, Share, CheckCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useProgress } from "../../../../src/hooks/useProgress";
import { getCourseById } from "../../../../src/services/coursesService";

export default function LessonScreen() {
  const { courseId, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  
  const { completeLesson, isLessonCompleted } = useProgress();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (courseId && lessonId) {
      setCompleted(isLessonCompleted(courseId as string, lessonId as string));
    }
  }, [courseId, lessonId, isLessonCompleted]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(courseId as string);
      setCourse(courseData);
      
      if (courseData?.lessons) {
        const lessonsArray = Object.keys(courseData.lessons).map(key => ({
          id: key,
          ...courseData.lessons[key]
        }));
        
        const index = lessonsArray.findIndex(l => l.id === lessonId);
        setLessonIndex(index);
        setTotalLessons(lessonsArray.length);
        
        if (index !== -1) {
          setLesson(lessonsArray[index]);
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (lessonIndex > 0 && course?.lessons) {
      const lessonsArray = Object.keys(course.lessons).map(key => ({
        id: key,
        ...course.lessons[key]
      }));
      const prevLesson = lessonsArray[lessonIndex - 1];
      router.push(`/courses/${courseId}/lessons/${prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (lessonIndex < totalLessons - 1 && course?.lessons) {
      const lessonsArray = Object.keys(course.lessons).map(key => ({
        id: key,
        ...course.lessons[key]
      }));
      const nextLesson = lessonsArray[lessonIndex + 1];
      router.push(`/courses/${courseId}/lessons/${nextLesson.id}`);
    } else {
      // If it's the last lesson, go to the course page
      router.push(`/courses/${courseId}`);
    }
  };

  const handleMarkComplete = async () => {
    if (!completed) {
      const result = await completeLesson(courseId as string, lessonId as string);
      if (result?.success) {
        setCompleted(true);
        Alert.alert("Great job! 🎉", "Lesson marked as complete! +10 XP", [
          { text: "Continue" }
        ]);
      }
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <AppText>Loading lesson...</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!course || !lesson) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <AppText>Lesson not found</AppText>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <AppText style={styles.backButtonText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <AppText style={styles.courseTitle}>{course.title}</AppText>
            <AppText style={styles.lessonProgress}>
              Lesson {lessonIndex + 1} of {totalLessons}
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setBookmarked(!bookmarked)} 
              style={styles.actionButton}
            >
              <Bookmark 
                size={24} 
                color={bookmarked ? Colors.primary : Colors.textLight} 
                fill={bookmarked ? Colors.primary : 'none'} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lesson Content */}
        <View style={styles.content}>
          <View style={styles.lessonHeader}>
            <AppText style={styles.lessonEmoji}>{lesson.emoji || '📚'}</AppText>
            <AppText style={styles.lessonTitle}>{lesson.title}</AppText>
            <AppText style={styles.lessonDuration}>
              ⏱️ {lesson.duration || '10 min'}
            </AppText>
            {completed && (
              <View style={styles.completedBadge}>
                <CheckCircle size={20} color={Colors.success} />
                <AppText style={styles.completedText}>Completed</AppText>
              </View>
            )}
          </View>

          {/* Video Placeholder - Replace with actual video player */}
          <View style={styles.videoPlaceholder}>
            <Play size={48} color="white" />
            <AppText style={styles.videoText}>Lesson Video</AppText>
          </View>

          {/* Lesson Content */}
          <View style={styles.textContent}>
            <AppText style={styles.sectionTitle}>What you'll learn</AppText>
            <AppText style={styles.paragraph}>
              {lesson.content || "This lesson covers important concepts. Watch the video and try the examples!"}
            </AppText>

            {lesson.codeExample && (
              <>
                <AppText style={styles.sectionTitle}>Try it yourself</AppText>
                <View style={styles.codeBlock}>
                  <AppText style={styles.codeText}>{lesson.codeExample}</AppText>
                </View>
              </>
            )}

            {lesson.keyPoints && lesson.keyPoints.length > 0 && (
              <>
                <AppText style={styles.sectionTitle}>Key Points</AppText>
                <View style={styles.keyPoints}>
                  {lesson.keyPoints.map((point: string, index: number) => (
                    <View key={index} style={styles.keyPoint}>
                      <View style={styles.keyPointIcon}>
                        <AppText>✅</AppText>
                      </View>
                      <AppText style={styles.keyPointText}>{point}</AppText>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navButton, lessonIndex === 0 && styles.disabledButton]} 
          onPress={handlePrevious}
          disabled={lessonIndex === 0}
        >
          <ChevronLeft size={20} color={lessonIndex === 0 ? Colors.textLight : Colors.primary} />
          <AppText style={[styles.navButtonText, lessonIndex === 0 && styles.disabledText]}>
            Previous
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.completeButton, completed && styles.completedButton]} 
          onPress={handleMarkComplete}
          disabled={completed}
        >
          <AppText style={styles.completeButtonText}>
            {completed ? 'Completed ✓' : 'Mark as Complete'}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, lessonIndex === totalLessons - 1 && styles.disabledButton]} 
          onPress={handleNext}
          disabled={lessonIndex === totalLessons - 1}
        >
          <AppText style={[styles.navButtonText, lessonIndex === totalLessons - 1 && styles.disabledText]}>
            Next
          </AppText>
          <ChevronRight size={20} color={lessonIndex === totalLessons - 1 ? Colors.textLight : Colors.primary} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  lessonProgress: {
    fontSize: 14,
    color: Colors.textLight,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  lessonHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lessonEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  lessonDuration: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 10,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  completedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  videoPlaceholder: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  videoText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  textContent: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 15,
  },
  codeBlock: {
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 5,
  },
  keyPoints: {
    marginBottom: 30,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  keyPointIcon: {
    marginRight: 15,
  },
  keyPointText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.primary,
    marginHorizontal: 8,
  },
  disabledText: {
    color: Colors.textLight,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  completedButton: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});