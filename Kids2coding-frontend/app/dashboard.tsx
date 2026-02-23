import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Home, Gamepad2, Puzzle, Bot, User } from "lucide-react-native";

import { AppText } from "../src/components/AppText";
import { CourseCard } from "../src/components/CourseCard";
import { ProgressCard } from "../src/components/ProgressCard";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";
import { getCourses } from "../src/services/coursesService";
import { getAllGames } from "../src/services/gamesService";
import { useAuth } from "../src/hooks/useAuth";
import { useProgress } from "../src/hooks/useProgress";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 70;

// Badge definitions based on XP thresholds
const BADGES = [
  { id: "1", name: "Novice", icon: "🌱", xpRequired: 0 },
  { id: "2", name: "Apprentice", icon: "🔰", xpRequired: 100 },
  { id: "3", name: "Coder", icon: "💻", xpRequired: 250 },
  { id: "4", name: "Master", icon: "🏆", xpRequired: 500 },
  { id: "5", name: "Legend", icon: "👑", xpRequired: 1000 },
];

// Dummy puzzles data (replace with Firebase later)
const PUZZLES = [
  { id: "1", title: "Sudoku", emoji: "🧩", description: "Classic number puzzle", color: "#6c5ce7" },
  { id: "2", title: "Word Search", emoji: "🔍", description: "Find hidden words", color: "#00b894" },
  { id: "3", title: "Maze", emoji: "🌀", description: "Navigate the maze", color: "#fdcb6e" },
];

// Dummy projects data (replace with Firebase later)
const PROJECTS = [
  { id: "1", title: "Space Invaders", author: "Alex", likes: 234, emoji: "👾" },
  { id: "2", title: "Weather App", author: "Sarah", likes: 156, emoji: "☀️" },
  { id: "3", title: "Portfolio", author: "Mike", likes: 189, emoji: "📁" },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { logout, isAuthenticated, user, loading } = useAuth();
  const { gamesWon, gamesLost, progress } = useProgress(); // progress contains totalXP
  const totalXP = progress?.totalXP || 0;

  const [courses, setCourses] = useState([]);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("Coder Kid");

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/home");
      return;
    }
    if (!isAuthenticated) return;

    const initDashboard = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        if (storedName) setName(storedName);

        const [coursesData, gamesData] = await Promise.all([
          getCourses(),
          getAllGames(),
        ]);
        setCourses(coursesData || []);
        setGames(gamesData || []);
      } catch (error) {
        console.error("Dashboard Loading Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initDashboard();
  }, [isAuthenticated, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 120],
    extrapolate: "clamp",
  });

  if (isLoading) {
    return (
      <View style={styles.loadingFull}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Taking you to your adventure...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <ImageBackground source={require("../assets/splash.jpg")} style={styles.headerBackground}>
          <View style={styles.headerDarken} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <AppText style={styles.greeting}>Welcome back, {name.split(" ")[0]}! 👋</AppText>
                <AppText style={styles.userName}>Let's create something amazing</AppText>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/profile")}>
                  <FontAwesome name="user-circle" size={38} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="school" size={24} color={Colors.primary} />
                <AppText style={styles.statValue}>{courses.length}</AppText>
                <AppText style={styles.statLabel}>Courses</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color={Colors.accent} />
                <AppText style={styles.statValue}>{gamesWon}</AppText>
                <AppText style={styles.statLabel}>Games Won</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <FontAwesome name="star" size={24} color={Colors.secondary} />
                <AppText style={styles.statValue}>{gamesLost}</AppText>
                <AppText style={styles.statLabel}>Games Lost</AppText>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <ProgressCard />

          {/* Games Section */}
          {games.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Fun Games 🎮</AppText>
                <TouchableOpacity onPress={() => router.push("/games")}>
                  <AppText style={styles.seeAll}>See All →</AppText>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {games.slice(0, 5).map((game: any) => (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.horizontalCard, { backgroundColor: game.color || Colors.primary }]}
                    onPress={() => router.push(`/games/${game.id}`)}
                  >
                    <AppText style={styles.cardEmoji}>{game.emoji || "🎮"}</AppText>
                    <AppText style={styles.cardTitle}>{game.title}</AppText>
                    <AppText style={styles.cardDescription} numberOfLines={2}>
                      {game.description}
                    </AppText>
                    <View style={styles.cardMeta}>
                      <AppText style={styles.cardMetaText}>
                        {game.levels ? Object.keys(game.levels).length : 0} levels
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Puzzles Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Puzzles 🧩</AppText>
              <TouchableOpacity onPress={() => router.push("/puzzles")}>
                <AppText style={styles.seeAll}>See All →</AppText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {PUZZLES.map((puzzle) => (
                <TouchableOpacity
                  key={puzzle.id}
                  style={[styles.horizontalCard, { backgroundColor: puzzle.color }]}
                  onPress={() => router.push(`/puzzles/${puzzle.id}`)}
                >
                  <AppText style={styles.cardEmoji}>{puzzle.emoji}</AppText>
                  <AppText style={styles.cardTitle}>{puzzle.title}</AppText>
                  <AppText style={styles.cardDescription} numberOfLines={2}>
                    {puzzle.description}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Courses Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Your Courses 📚</AppText>
              <TouchableOpacity onPress={() => router.push("/courses")}>
                <AppText style={styles.seeAll}>See All →</AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.coursesGrid}>
              {courses.length > 0 ? (
                courses.slice(0, 4).map((course: any) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onPress={() => router.push(`/courses/${course.id}`)}
                    style={styles.courseCard}
                  />
                ))
              ) : (
                <AppText style={styles.emptyText}>No courses found. Start learning today!</AppText>
              )}
            </View>
          </View>

          {/* Projects Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Projects 🏗️</AppText>
              <TouchableOpacity onPress={() => router.push("/projects")}>
                <AppText style={styles.seeAll}>See All →</AppText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {PROJECTS.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => router.push(`/projects/${project.id}`)}
                >
                  <AppText style={styles.projectEmoji}>{project.emoji}</AppText>
                  <AppText style={styles.projectTitle}>{project.title}</AppText>
                  <AppText style={styles.projectAuthor}>by {project.author}</AppText>
                  <View style={styles.projectLikes}>
                    <AppText style={styles.likeIcon}>❤️</AppText>
                    <AppText style={styles.likeCount}>{project.likes}</AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Badges Section */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Your Badges 🏅</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {BADGES.map((badge) => {
                const earned = totalXP >= badge.xpRequired;
                return (
                  <View
                    key={badge.id}
                    style={[
                      styles.badgeCard,
                      !earned && styles.badgeCardLocked,
                    ]}
                  >
                    <AppText style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                      {badge.icon}
                    </AppText>
                    <AppText style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
                      {badge.name}
                    </AppText>
                    <AppText style={styles.badgeXP}>{badge.xpRequired} XP</AppText>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/dashboard")}>
          <Home size={24} color={Colors.primary} />
          <AppText style={styles.tabLabel}>Home</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/games")}>
          <Gamepad2 size={24} color={Colors.textLight} />
          <AppText style={styles.tabLabel}>Games</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/puzzles")}>
          <Puzzle size={24} color={Colors.textLight} />
          <AppText style={styles.tabLabel}>Puzzles</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/ai-buddy")}>
          <Bot size={24} color={Colors.textLight} />
          <AppText style={styles.tabLabel}>AI</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/profile")}>
          <User size={24} color={Colors.textLight} />
          <AppText style={styles.tabLabel}>Profile</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  header: {
    overflow: "hidden",
  },
  headerBackground: {
    flex: 1,
  },
  headerDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#eee",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: TAB_BAR_HEIGHT + 20, // space for tab bar
  },
  content: {
    padding: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  horizontalCard: {
    width: 140,
    padding: 15,
    borderRadius: 15,
    marginRight: 12,
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginVertical: 5,
  },
  cardMeta: {
    marginTop: 5,
  },
  cardMetaText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  courseCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
  },
  emptyText: {
    color: "#666",
    marginTop: 20,
    textAlign: "center",
    width: "100%",
  },
  projectCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  projectAuthor: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 4,
  },
  projectLikes: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  likeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  likeCount: {
    fontSize: 10,
    color: Colors.textLight,
  },
  badgeCard: {
    width: 100,
    backgroundColor: Colors.primary + "20",
    borderRadius: 15,
    padding: 15,
    marginRight: 12,
    alignItems: "center",
  },
  badgeCardLocked: {
    backgroundColor: Colors.borderLight,
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: Colors.textLight,
  },
  badgeXP: {
    fontSize: 10,
    color: Colors.textLight,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 4,
  },
  profileButton: {
    marginRight: 10,
  },
  logoutButton: {},
});