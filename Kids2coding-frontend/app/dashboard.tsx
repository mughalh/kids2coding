import { useRouter } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../src/components/AppText";
import { CourseCard } from "../src/components/CourseCard";
import { ProgressCard } from "../src/components/ProgressCard";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";
import { coursesData } from "../src/data/coursesData";
import { database } from "../src/firebase/config";
import { useAuth } from "../src/hooks/useAuth";
import { useProgress } from "../src/hooks/useProgress";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { progress, getCourseProgress, getUserLevel, getLevelProgress, loading: progressLoading } = useProgress();

  const [userData, setUserData] = useState({
    coursesCount: 0,
    badgesCount: 0,
    progress: 0,
    displayName: "",
  });
  const [dbLoading, setDbLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Get user level from progress hook
  const userLevel = getUserLevel();
  const levelProgress = getLevelProgress();

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // --- DATABASE LISTENER ---
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = ref(database, `users/${user.uid}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData({
          displayName: data.displayName || user.displayName || "Coder Kid",
          coursesCount: data.completedLessons
            ? Object.keys(data.completedLessons).length
            : 0,
          badgesCount: data.badges ? data.badges.length : 0,
          progress: data.points
            ? Math.min(Math.round((data.points / 1000) * 100), 100)
            : 0,
        });
      } else {
        setUserData((prev) => ({
          ...prev,
          displayName: user.displayName || "Coder Kid",
        }));
      }
      setDbLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 120],
    extrapolate: "clamp",
  });

  const getFirstName = () => {
    if (!userData.displayName) return "Coder";
    return userData.displayName.split(" ")[0];
  };

  if (authLoading || dbLoading || progressLoading) {
    return (
      <View style={styles.loadingFull}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <ImageBackground
          source={require("../assets/splash.jpg")}
          style={styles.headerBackground}
        >
          <View style={styles.headerDarken} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <AppText style={styles.greeting}>
                  Welcome back, {getFirstName()}! 👋
                </AppText>
                <AppText style={styles.userName}>
                  Let's create something amazing
                </AppText>
              </View>

              {/* PROFILE + LOGOUT */}
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => router.push("/profile")}
                >
                  <FontAwesome name="user-circle" size={38} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Level Badge */}
            <View style={styles.levelBadge}>
              <AppText style={styles.levelBadgeText}>Level {userLevel}</AppText>
              <View style={styles.levelProgressBar}>
                <View 
                  style={[
                    styles.levelProgressFill, 
                    { width: `${levelProgress}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="school" size={24} color={Colors.primary} />
                <AppText style={styles.statValue}>
                  {userData.coursesCount}
                </AppText>
                <AppText style={styles.statLabel}>Lessons</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color={Colors.accent} />
                <AppText style={styles.statValue}>
                  {userData.badgesCount}
                </AppText>
                <AppText style={styles.statLabel}>Badges</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <FontAwesome name="star" size={24} color={Colors.secondary} />
                <AppText style={styles.statValue}>{progress?.totalXP || 0} XP</AppText>
                <AppText style={styles.statLabel}>Total XP</AppText>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <ProgressCard />

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Quick Actions ⚡</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { icon: "🎮", title: "Games", screen: "/games" },
                { icon: "🧩", title: "Puzzles", screen: "/puzzles" },
                { icon: "🏆", title: "Challenges", screen: "/challenges" },
                { icon: "🤖", title: "AI Buddy", screen: "/ai-buddy" },
              ].map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAction}
                  onPress={() => router.push(action.screen)}
                >
                  <AppText style={styles.quickActionIcon}>
                    {action.icon}
                  </AppText>
                  <AppText style={styles.quickActionText}>
                    {action.title}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Your Courses 📚</AppText>
              <TouchableOpacity onPress={() => router.push("/courses")}>
                <AppText style={styles.seeAll}>See All →</AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.coursesGrid}>
              {coursesData.slice(0, 4).map((course) => {
                // Calculate progress for this course
                const courseProgress = getCourseProgress(course.id, course.lessons || 10);
                
                return (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      progress: courseProgress, // This will show in your card!
                    }}
                    onPress={() => router.push(`/courses/${course.id}`)}
                    style={styles.courseCard}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingFull: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { overflow: "hidden" },
  headerBackground: { flex: 1 },
  headerDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerContent: { paddingHorizontal: 20, paddingTop: 20 },

  greeting: { fontSize: 16, color: "white", opacity: 0.9, fontWeight: "600" },
  userName: { fontSize: 22, fontWeight: "bold", color: "white" },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    elevation: 10,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "bold", marginTop: 2 },
  statLabel: { fontSize: 11, color: Colors.textLight },
  statDivider: { width: 1, height: "80%", backgroundColor: "#eee" },

  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold" },
  seeAll: { color: Colors.primary, fontWeight: "bold" },

  quickAction: {
    width: 85,
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 20,
    marginRight: 12,
  },
  quickActionIcon: { fontSize: 24, marginBottom: 5 },
  quickActionText: { fontSize: 11, fontWeight: "bold" },

  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  courseCard: { width: (width - 50) / 2, marginBottom: 15 },

  // --- PROFILE & LOGOUT ICONS MOBILE FRIENDLY ---
  headerActions: {
    flexDirection: "row",       // icons side by side
    alignItems: "center",       // vertical center
    justifyContent: "flex-end", // right side of header
  },
  profileButton: {
    padding: 5,                 // touch area friendly
  },
  logoutButton: {
    padding: 5,                 // touch area friendly
    marginLeft: 15,             // spacing between profile & logout
  },
});

