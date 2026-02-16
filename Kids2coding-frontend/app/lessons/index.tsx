import { useRouter } from "expo-router";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { coursesData, courseDetails } from "../../src/data/coursesData";


export default function AllLessonsScreen() {
  const router = useRouter();

  // Flatten all lessons from all courses
  const allLessons = coursesData.flatMap(course => 
    (courseDetails[course.id]?.syllabus || []).map(lesson => ({
      ...lesson,
      courseId: course.id,
      courseTitle: course.title,
      courseColor: course.color,
    }))
  );

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.lessonCard, { borderLeftColor: item.courseColor }]}
      onPress={() => router.push(`/courses/${item.courseId}/lessons/${item.id}`)}
    >
      <View style={styles.lessonHeader}>
        <AppText style={styles.lessonEmoji}>{item.emoji}</AppText>
        <View style={styles.lessonInfo}>
          <AppText style={styles.lessonTitle}>{item.title}</AppText>
          <AppText style={styles.courseTitle}>{item.courseTitle}</AppText>
        </View>
      </View>
      <View style={styles.lessonMeta}>
        <AppText style={styles.lessonDuration}>{item.duration}</AppText>
        <AppText style={styles.lessonType}>{item.type}</AppText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper scrollable>
      <View style={styles.header}>
        <AppText style={styles.title}>All Lessons</AppText>
        <AppText style={styles.subtitle}>Browse through all available lessons</AppText>
      </View>
      <FlatList
        data={allLessons}
        renderItem={renderLessonItem}
        keyExtractor={item => `${item.courseId}-${item.id}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
});