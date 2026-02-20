import { useRouter } from "expo-router";
import { Filter, Grid, List, Search } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { CourseCard } from "../../src/components/CourseCard";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { getCourses } from "../../src/services/coursesService";
import { useProgress } from "../../src/hooks/useProgress";
import { database } from "../../src/firebase/config"; // 👈 IMPORTANT: add this import
import { get, ref } from "firebase/database"; // for root check

export default function CoursesScreen() {
  const router = useRouter();
  const { getCourseProgress } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', label: 'All Courses', emoji: '📚' },
    { id: 'beginner', label: 'Beginner', emoji: '🐣' },
    { id: 'intermediate', label: 'Intermediate', emoji: '🚀' },
    { id: 'advanced', label: 'Advanced', emoji: '🧠' },
    { id: 'games', label: 'Games', emoji: '🎮' },
    { id: 'projects', label: 'Projects', emoji: '🏗️' },
  ];

  const loadCourses = useCallback(async () => {
    console.log("🔍 [loadCourses] Starting to fetch courses...");
    console.log("🔍 [loadCourses] database object:", database ? "exists" : "undefined");
    
    try {
      // Test 1: Check database initialization
      if (!database) {
        console.error("❌ [loadCourses] database is undefined!");
        return;
      }
      console.log("✅ [loadCourses] database is initialized");

      // Test 2: Fetch courses via service
      const coursesData = await getCourses();
      console.log("📊 [loadCourses] getCourses() returned:", coursesData);
      console.log("📊 [loadCourses] Number of courses:", coursesData.length);
      
      if (coursesData.length > 0) {
        console.log("📘 [loadCourses] First course sample:", JSON.stringify(coursesData[0], null, 2));
        // Check if the course has required fields
        const sample = coursesData[0];
        console.log("   - id:", sample.id);
        console.log("   - title:", sample.title);
        console.log("   - level:", sample.level);
        console.log("   - tags:", sample.tags);
        console.log("   - lessonsCount:", sample.lessonsCount);
        console.log("   - color:", sample.color);
        console.log("   - bgColor:", sample.bgColor);
      } else {
        console.warn("⚠️ [loadCourses] No courses returned from getCourses()");
        
        // Test 3: Direct root check
        try {
          console.log("🔍 [loadCourses] Checking root database...");
          const rootRef = ref(database, '/');
          const rootSnap = await get(rootRef);
          if (rootSnap.exists()) {
            const rootKeys = Object.keys(rootSnap.val());
            console.log("📁 [loadCourses] Root keys:", rootKeys);
            if (rootKeys.includes('courses')) {
              console.log("✅ [loadCourses] 'courses' node found at root");
              // Check inside courses
              const coursesRef = ref(database, 'courses');
              const coursesSnap = await get(coursesRef);
              if (coursesSnap.exists()) {
                const coursesObj = coursesSnap.val();
                console.log("📦 [loadCourses] Courses node data:", coursesObj);
                console.log("🔑 [loadCourses] Courses keys:", Object.keys(coursesObj));
              } else {
                console.log("❌ [loadCourses] 'courses' node is empty");
              }
            } else {
              console.log("❌ [loadCourses] 'courses' node NOT found. Available roots:", rootKeys);
            }
          } else {
            console.log("❌ [loadCourses] Database is completely empty");
          }
        } catch (rootErr) {
          console.error("❌ [loadCourses] Error checking root:", rootErr);
        }
      }
      
      setCourses(coursesData);
    } catch (error) {
      console.error("❌ [loadCourses] Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("🏁 [loadCourses] Finished. loading set to false");
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  // Filter courses with detailed logging
  const filteredCourses = courses.filter(course => {
    console.log("🔎 [filter] Checking course:", course.title);
    console.log("   - searchQuery:", searchQuery);
    console.log("   - selectedCategory:", selectedCategory);
    
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    console.log("   - matchesSearch:", matchesSearch);

    // Fixed: treat 'all' specially, otherwise exact match on level or tags
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
      console.log("   - selectedCategory is 'all', automatically true");
    } else {
      // Try exact match on level first
      const levelMatch = course.level && course.level.toLowerCase() === selectedCategory;
      const tagMatch = course.tags && course.tags.some(tag => tag.toLowerCase() === selectedCategory);
      matchesCategory = levelMatch || tagMatch;
      console.log("   - levelMatch:", levelMatch);
      console.log("   - tagMatch:", tagMatch);
    }
    console.log("   - matchesCategory:", matchesCategory);
    
    const result = matchesSearch && matchesCategory;
    console.log("   - INCLUDED:", result);
    return result;
  });

  console.log("📋 [render] courses.length:", courses.length);
  console.log("📋 [render] filteredCourses.length:", filteredCourses.length);

  // Loading state
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <AppText style={styles.loadingText}>Loading courses...</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AppText style={styles.title}>Learning Adventure 📚</AppText>
          <View style={styles.viewControls}>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={20} color={viewMode === 'grid' ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.category,
              selectedCategory === category.id && styles.categoryActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <AppText style={styles.categoryEmoji}>{category.emoji}</AppText>
            <AppText style={[
              styles.categoryLabel,
              selectedCategory === category.id && styles.categoryLabelActive
            ]}>
              {category.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText style={styles.emptyEmoji}>🔍</AppText>
            <AppText style={styles.emptyTitle}>No courses found</AppText>
            <AppText style={styles.emptyText}>
              {courses.length === 0 
                ? "No courses available yet. Check back soon!"
                : "Try a different search or browse all courses"}
            </AppText>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.grid}>
            {filteredCourses.map((course) => {
              // Calculate progress for this course
              const courseProgress = getCourseProgress(course.id, course.lessonsCount || 10);
              console.log(`🃏 Rendering CourseCard for ${course.title} with progress ${courseProgress}`);
              
              // Map fields to what CourseCard expects
              const cardCourse = {
                ...course,
                lessons: course.lessonsCount || 0,      // map lessonsCount to lessons
                bgColor: course.bgColor || '#F3F4F6',   // provide default
                progress: courseProgress,
              };
              
              return (
                <CourseCard
                  key={course.id}
                  course={cardCourse}
                  onPress={() => router.push(`/courses/${course.id}`)}
                  style={styles.gridCard}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredCourses.map((course) => {
              const courseProgress = getCourseProgress(course.id, course.lessonsCount || 10);
              const cardCourse = {
                ...course,
                lessons: course.lessonsCount || 0,
                bgColor: course.bgColor || '#F3F4F6',
                progress: courseProgress,
              };
              return (
                <CourseCard
                  key={course.id}
                  course={cardCourse}
                  onPress={() => router.push(`/courses/${course.id}`)}
                  style={styles.listCard}
                  horizontal
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // ... keep all existing styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: Colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  filterButton: {
    padding: 8,
  },
  categories: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  category: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    minWidth: 100,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryLabelActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 15,
  },
  list: {
    gap: 15,
  },
  listCard: {
    marginBottom: 15,
  },
  emptyState: {
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
    maxWidth: 300,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
});