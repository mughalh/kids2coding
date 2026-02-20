import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { getCourses } from "../../src/services/coursesService";

export default function AllLessonsScreen() {
  const router = useRouter();
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllLessons();
  }, []);

  const loadAllLessons = async () => {
    try {
      setLoading(true);
      const courses = await getCourses();
      
      // Flatten all lessons from all courses
      const lessons = courses.flatMap(course => {
        if (!course.lessons) return [];
        
        return Object.keys(course.lessons).map(lessonKey => ({
          id: lessonKey,
          ...course.lessons[lessonKey],
          courseId: course.id,
          courseTitle: course.title,
          courseColor: course.color || Colors.primary,
          courseEmoji: course.emoji || '📚',
        }));
      });

      // Sort by course and lesson order (optional)
      setAllLessons(lessons);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.lessonCard, { borderLeftColor: item.courseColor }]}
      onPress={() => router.push(`/courses/${item.courseId}/lessons/${item.id}`)}
    >
      <View style={styles.lessonHeader}>
        <AppText style={styles.lessonEmoji}>{item.emoji || '📚'}</AppText>
        <View style={styles.lessonInfo}>
          <AppText style={styles.lessonTitle}>{item.title}</AppText>
          <View style={styles.courseInfo}>
            <AppText style={styles.courseEmoji}>{item.courseEmoji}</AppText>
            <AppText style={styles.courseTitle}>{item.courseTitle}</AppText>
          </View>
        </View>
      </View>
      <View style={styles.lessonMeta}>
        <AppText style={styles.lessonDuration}>
          ⏱️ {item.duration || '10 min'}
        </AppText>
        <AppText style={styles.lessonType}>
          {item.type || 'lesson'}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <AppText style={styles.loadingText}>Loading lessons...</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <AppText style={styles.title}>All Lessons 📚</AppText>
        <AppText style={styles.subtitle}>Browse through all available lessons</AppText>
      </View>
      
      {allLessons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyEmoji}>📚</AppText>
          <AppText style={styles.emptyTitle}>No lessons yet</AppText>
          <AppText style={styles.emptyText}>
            Check back soon for new content!
          </AppText>
        </View>
      ) : (
        <FlatList
          data={allLessons}
          renderItem={renderLessonItem}
          keyExtractor={item => `${item.courseId}-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 5,
  },
  listContent: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  lessonEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseEmoji: {
    fontSize: 14,
    marginRight: 5,
  },
  courseTitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonDuration: {
    fontSize: 14,
    color: Colors.textLight,
  },
  lessonType: {
    fontSize: 14,
    color: Colors.textLight,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});