import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Animated 
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { coursesData, courseDetails } from "../../src/data/coursesData";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Play, 
  BookOpen, 
  Trophy, 
  Award, 
  ChevronRight,
  Download,
  Share2,
  Star
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import { useProgress } from "../../src/hooks/useProgress";

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const { enrollInCourse, progress } = useProgress();
  
  const course = coursesData.find(c => c.id === courseId) || coursesData[0];
  const details = courseDetails[courseId] || courseDetails['web-basics'];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const enrolled = progress?.enrolledCourses?.includes(courseId);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEnroll = async () => {
    await enrollInCourse(courseId);
    router.push(`/courses/${courseId}/lessons/${details.syllabus[0].id}`);
  };

  const handleContinue = () => {
    // Find first incomplete lesson or go to first lesson
    const firstIncomplete = details.syllabus.find(lesson => !lesson.completed);
    router.push(`/courses/${courseId}/lessons/${firstIncomplete?.id || details.syllabus[0].id}`);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[course.color, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.courseHeader}>
              <View style={styles.emojiContainer}>
                <AppText style={styles.heroEmoji}>{course.emoji}</AppText>
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
                <AppText style={styles.statText}>{course.lessons} lessons</AppText>
              </View>
              <View style={styles.stat}>
                <Trophy size={16} color="white" />
                <AppText style={styles.statText}>{course.badges.length} badges</AppText>
              </View>
              <View style={styles.stat}>
                <Award size={16} color="white" />
                <AppText style={styles.statText}>{course.level}</AppText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Enroll/Continue Button */}
          <View style={styles.actionSection}>
            {enrolled ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.continueButton]}
                onPress={handleContinue}
              >
                <Play size={20} color="white" />
                <AppText style={styles.actionButtonText}>Continue Learning</AppText>
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
            <AppText style={styles.overviewText}>{details.overview}</AppText>
          </View>

          {/* Learning Objectives */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>What You'll Learn 🎯</AppText>
            {details.learningObjectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Star size={16} color={Colors.primary} style={styles.objectiveIcon} />
                <AppText style={styles.objectiveText}>{objective}</AppText>
              </View>
            ))}
          </View>

          {/* Syllabus */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Course Content 📝</AppText>
              <AppText style={styles.lessonCount}>{details.syllabus.length} lessons</AppText>
            </View>
            {details.syllabus.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonItem,
                  lesson.completed && styles.lessonCompleted
                ]}
                onPress={() => router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
              >
                <View style={styles.lessonNumber}>
                  <AppText style={styles.lessonNumberText}>{index + 1}</AppText>
                </View>
                <View style={styles.lessonContent}>
                  <View style={styles.lessonHeader}>
                    <AppText style={styles.lessonEmoji}>{lesson.emoji}</AppText>
                    <AppText style={styles.lessonTitle}>{lesson.title}</AppText>
                    {lesson.completed && (
                      <View style={styles.completedBadge}>
                        <AppText style={styles.completedText}>✓</AppText>
                      </View>
                    )}
                  </View>
                  <View style={styles.lessonMeta}>
                    <AppText style={styles.lessonType}>{lesson.type}</AppText>
                    <AppText style={styles.lessonDuration}>{lesson.duration}</AppText>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Projects */}
          {details.projects && details.projects.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Fun Projects 🏗️</AppText>
              {details.projects.map((project, index) => (
                <View key={index} style={styles.projectCard}>
                  <AppText style={styles.projectEmoji}>{project.emoji}</AppText>
                  <View style={styles.projectContent}>
                    <AppText style={styles.projectTitle}>{project.title}</AppText>
                    <AppText style={styles.projectDescription}>{project.description}</AppText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quizzes */}
          {details.quizzes && details.quizzes.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Quizzes 🧠</AppText>
              {details.quizzes.map((quiz, index) => (
                <TouchableOpacity 
                  key={quiz.id}
                  style={styles.quizCard}
                  onPress={() => router.push(`/courses/${courseId}/quiz/${quiz.id}`)}
                >
                  <View style={styles.quizHeader}>
                    <AppText style={styles.quizEmoji}>{quiz.emoji}</AppText>
                    <View style={styles.quizInfo}>
                      <AppText style={styles.quizTitle}>{quiz.title}</AppText>
                      <AppText style={styles.quizQuestions}>{quiz.questions} questions</AppText>
                    </View>
                  </View>
                  {quiz.passed ? (
                    <View style={styles.quizPassed}>
                      <AppText style={styles.quizPassedText}>Passed! 🎉</AppText>
                    </View>
                  ) : (
                    <ChevronRight size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 15,
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
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  objectiveIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
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
    marginBottom: 5,
  },
  lessonEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  projectCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  quizEmoji: {
    fontSize: 20,
    marginRight: 15,
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
  quizPassed: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quizPassedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});