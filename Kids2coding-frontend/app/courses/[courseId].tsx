import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Animated 
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Play, 
  BookOpen, 
  Trophy, 
  Award, 
  ChevronRight,
  Download,
  Share2,
  Star,
  CheckCircle
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "../../src/hooks/useProgress";
import { getCourseById } from "../../src/services/coursesService";
import { useAppContext } from "../../src/contexts/AppContext";

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const { enrollInCourse, progress, isEnrolled, isLessonCompleted, getQuizScore } = useProgress();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(courseId as string);
      setCourse(courseData);
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enrolled = isEnrolled(courseId as string);

  const handleEnroll = async () => {
    await enrollInCourse(courseId as string);
  };

  const handleStartLesson = (lessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/courses/${courseId}/quiz/${quizId}`);
  };

  const { setCurrentContext } = useAppContext();

  useEffect(() => {
    setCurrentContext('course', { courseId: courseId as string });
    
    return () => {
      setCurrentContext('course', { courseId: null }); // Clear when leaving
    };
  }, [courseId]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <AppText>Loading course details...</AppText>
          </Animated.View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !course) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <AppText>{error || 'Course not found'}</AppText>
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

  // Prepare lessons and quizzes arrays
  const lessons = course.lessons ? Object.keys(course.lessons).map(key => ({
    id: key,
    ...course.lessons[key]
  })) : [];

  const quizzes = course.quizzes ? Object.keys(course.quizzes).map(key => ({
    id: key,
    ...course.quizzes[key]
  })) : [];

  // Calculate stats
  const completedLessons = lessons.filter(l => isLessonCompleted(courseId as string, l.id)).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <ErrorBoundary>
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[course.color || Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.courseHeader}>
              <View style={styles.emojiContainer}>
                <AppText style={styles.heroEmoji}>{course.emoji || '📚'}</AppText>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Share2 size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Download size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            <AppText style={styles.courseTitle}>{course.title}</AppText>
            <AppText style={styles.courseDescription}>{course.description}</AppText>
            
            <View style={styles.heroStats}>
              <View style={styles.stat}>
                <BookOpen size={16} color="white" />
                <AppText style={styles.statText}>{totalLessons} lessons</AppText>
              </View>
              <View style={styles.stat}>
                <Trophy size={16} color="white" />
                <AppText style={styles.statText}>{quizzes.length} quizzes</AppText>
              </View>
              <View style={styles.stat}>
                <Award size={16} color="white" />
                <AppText style={styles.statText}>{course.level}</AppText>
              </View>
            </View>

            {/* Progress Bar if enrolled */}
            {enrolled && totalLessons > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <AppText style={styles.progressText}>Progress: {progressPercent}%</AppText>
                  <AppText style={styles.progressText}>{completedLessons}/{totalLessons} lessons</AppText>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Enroll/Continue Button */}
          <View style={styles.actionSection}>
            {enrolled ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.continueButton]}
                onPress={() => {
                  const firstIncomplete = lessons.find(l => !isLessonCompleted(courseId as string, l.id));
                  handleStartLesson(firstIncomplete?.id || lessons[0]?.id);
                }}
              >
                <Play size={20} color="white" />
                <AppText style={styles.actionButtonText}>
                  {completedLessons === totalLessons ? 'Review Course' : 'Continue Learning'}
                </AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.enrollButton]}
                onPress={handleEnroll}
              >
                <BookOpen size={20} color="white" />
                <AppText style={styles.actionButtonText}>Start Course</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Overview */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>About This Course</AppText>
            <AppText style={styles.overviewText}>{course.description}</AppText>
          </View>

          {/* Lessons */}
          {lessons.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Lessons 📖</AppText>
                <AppText style={styles.lessonCount}>{lessons.length} lessons</AppText>
              </View>
              {lessons.map((lesson, index) => {
                const completed = isLessonCompleted(courseId as string, lesson.id);
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonItem,
                      completed && styles.lessonCompleted
                    ]}
                    onPress={() => handleStartLesson(lesson.id)}
                    disabled={!enrolled}
                  >
                    <View style={styles.lessonNumber}>
                      <AppText style={styles.lessonNumberText}>{index + 1}</AppText>
                    </View>
                    <View style={styles.lessonContent}>
                      <View style={styles.lessonHeader}>
                        <AppText style={styles.lessonTitle}>{lesson.title}</AppText>
                        {completed && (
                          <CheckCircle size={18} color={Colors.success} />
                        )}
                      </View>
                      <View style={styles.lessonMeta}>
                        <AppText style={styles.lessonType}>{lesson.type || 'Lesson'}</AppText>
                        <AppText style={styles.lessonDuration}>{lesson.duration || '10 min'}</AppText>
                      </View>
                    </View>
                    <ChevronRight size={20} color={Colors.textLight} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Quizzes */}
          {quizzes.length > 0 && enrolled && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Quizzes 🧠</AppText>
                <AppText style={styles.lessonCount}>{quizzes.length} quizzes</AppText>
              </View>
              {quizzes.map((quiz, index) => {
                const score = getQuizScore(courseId as string, quiz.id);
                return (
                  <TouchableOpacity 
                    key={quiz.id}
                    style={styles.quizCard}
                    onPress={() => handleStartQuiz(quiz.id)}
                  >
                    <View style={styles.quizHeader}>
                      <View style={styles.quizEmojiContainer}>
                        <AppText style={styles.quizEmoji}>📝</AppText>
                      </View>
                      <View style={styles.quizInfo}>
                        <AppText style={styles.quizTitle}>{quiz.title}</AppText>
                        <AppText style={styles.quizQuestions}>
                          {quiz.questions?.length || 0} questions
                        </AppText>
                      </View>
                    </View>
                    {score ? (
                      <View style={styles.quizScore}>
                        <AppText style={styles.quizScoreText}>
                          {score.score}/{score.total}
                        </AppText>
                      </View>
                    ) : (
                      <ChevronRight size={20} color={Colors.textLight} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 32,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 26,
    marginBottom: 25,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: 'white',
    fontSize: 14,
  },
  progressSection: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  actionSection: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 20,
  },
  enrollButton: {
    backgroundColor: Colors.primary,
  },
  continueButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  lessonCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  overviewText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lessonCompleted: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  lessonNumber: {
    width: 36,
    height: 36,
    backgroundColor: Colors.borderLight,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  lessonType: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'capitalize',
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quizHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizEmojiContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizEmoji: {
    fontSize: 20,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },
  quizQuestions: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quizScore: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quizScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});