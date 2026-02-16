import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { AppText } from "../../../../src/components/AppText";
import { ScreenWrapper } from "../../../../src/components/ScreenWrapper";
import { Colors } from "../../../../src/constants/colors";
import { coursesData, courseDetails } from "../../../../src/data/coursesData";
import { Play, ChevronLeft, ChevronRight, Bookmark, Share } from "lucide-react-native";
import { useState } from "react";

export default function LessonScreen() {
  const { courseId, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const course = coursesData.find(c => c.id === courseId);
  const details = courseDetails[courseId as string];
  const lessonIndex = details?.syllabus.findIndex(l => l.id === lessonId) || 0;
  const lesson = details?.syllabus[lessonIndex];

  const totalLessons = details?.syllabus.length || 0;

  const handlePrevious = () => {
    if (lessonIndex > 0) {
      const prevLesson = details?.syllabus[lessonIndex - 1];
      router.push(`/courses/${courseId}/lessons/${prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (lessonIndex < totalLessons - 1) {
      const nextLesson = details?.syllabus[lessonIndex + 1];
      router.push(`/courses/${courseId}/lessons/${nextLesson.id}`);
    } else {
      // If it's the last lesson, go to the course page or quiz?
      router.push(`/courses/${courseId}`);
    }
  };

  if (!course || !lesson) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <AppText>Lesson not found</AppText>
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
            <AppText style={styles.lessonProgress}>Lesson {lessonIndex + 1} of {totalLessons}</AppText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setBookmarked(!bookmarked)} style={styles.actionButton}>
              <Bookmark size={24} color={bookmarked ? Colors.primary : Colors.textLight} fill={bookmarked ? Colors.primary : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lesson Content */}
        <View style={styles.content}>
          <View style={styles.lessonHeader}>
            <AppText style={styles.lessonEmoji}>{lesson.emoji}</AppText>
            <AppText style={styles.lessonTitle}>{lesson.title}</AppText>
            <AppText style={styles.lessonDuration}>⏱️ {lesson.duration}</AppText>
          </View>

          <View style={styles.videoPlaceholder}>
            <Play size={48} color="white" />
            <AppText style={styles.videoText}>Video Lesson</AppText>
          </View>

          <View style={styles.textContent}>
            <AppText style={styles.sectionTitle}>What you'll learn</AppText>
            <AppText style={styles.paragraph}>
              This lesson will teach you the basics of {lesson.title}. You'll learn by watching the video and then practicing with interactive examples.
            </AppText>
            <AppText style={styles.paragraph}>
              Remember to take notes and try the examples yourself!
            </AppText>

            <AppText style={styles.sectionTitle}>Try it yourself</AppText>
            <View style={styles.codeBlock}>
              <AppText style={styles.codeText}>// Write your code here</AppText>
              <AppText style={styles.codeText}>console.log("Hello, world!");</AppText>
            </View>

            <AppText style={styles.sectionTitle}>Key Points</AppText>
            <View style={styles.keyPoints}>
              <View style={styles.keyPoint}>
                <View style={styles.keyPointIcon}>
                  <AppText>✅</AppText>
                </View>
                <AppText style={styles.keyPointText}>Point 1</AppText>
              </View>
              <View style={styles.keyPoint}>
                <View style={styles.keyPointIcon}>
                  <AppText>✅</AppText>
                </View>
                <AppText style={styles.keyPointText}>Point 2</AppText>
              </View>
              <View style={styles.keyPoint}>
                <View style={styles.keyPointIcon}>
                  <AppText>✅</AppText>
                </View>
                <AppText style={styles.keyPointText}>Point 3</AppText>
              </View>
            </View>
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
          <AppText style={[styles.navButtonText, lessonIndex === 0 && styles.disabledText]}>Previous</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeButton}>
          <AppText style={styles.completeButtonText}>Mark as Complete</AppText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, lessonIndex === totalLessons - 1 && styles.disabledButton]} 
          onPress={handleNext}
          disabled={lessonIndex === totalLessons - 1}
        >
          <AppText style={[styles.navButtonText, lessonIndex === totalLessons - 1 && styles.disabledText]}>Next</AppText>
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
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});