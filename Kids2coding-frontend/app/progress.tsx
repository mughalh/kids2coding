import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    BarChart3,
    BookOpen,
    Clock,
    TrendingUp,
    Zap
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";

const { width } = Dimensions.get("window");

export default function ProgressScreen() {
  const router = useRouter();
  const [timeFrame, setTimeFrame] = useState("week"); // 'week', 'month', 'all'
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'courses', 'goals'
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const stats = {
    totalXP: 5240,
    level: 8,
    nextLevelXP: 6000,
    progress: 65,
    streak: 14,
    completedLessons: 42,
    completedCourses: 3,
    totalHours: 28.5,
    accuracy: 87,
  };

  const weeklyProgress = [
    { day: "Mon", lessons: 3, xp: 120, hours: 1.5 },
    { day: "Tue", lessons: 4, xp: 180, hours: 2 },
    { day: "Wed", lessons: 2, xp: 90, hours: 1 },
    { day: "Thu", lessons: 5, xp: 210, hours: 2.5 },
    { day: "Fri", lessons: 3, xp: 130, hours: 1.5 },
    { day: "Sat", lessons: 6, xp: 240, hours: 3 },
    { day: "Sun", lessons: 4, xp: 190, hours: 2 },
  ];

  const coursesProgress = [
    { name: "Web Basics", progress: 85, color: Colors.primary },
    { name: "JavaScript", progress: 60, color: Colors.warning },
    { name: "Python", progress: 30, color: Colors.success },
    { name: "Game Dev", progress: 15, color: Colors.accent },
  ];

  const goals = [
    { title: "Reach Level 10", progress: 80, deadline: "2 weeks", icon: "🏆" },
    { title: "Complete 50 Lessons", progress: 84, deadline: "1 week", icon: "📚" },
    { title: "30-Day Streak", progress: 47, deadline: "16 days", icon: "🔥" },
    { title: "Master 3 Courses", progress: 33, deadline: "1 month", icon: "🎓" },
  ];

  const achievements = [
    { title: "Quick Learner", description: "Complete 5 lessons in a day", earned: true, icon: "⚡" },
    { title: "Weekend Warrior", description: "Learn for 5 hours on weekend", earned: true, icon: "🏋️‍♂️" },
    { title: "Perfect Score", description: "Get 100% on 3 quizzes", earned: false, icon: "💯" },
    { title: "Early Bird", description: "Complete lessons before 8 AM", earned: true, icon: "🌅" },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: stats.progress / 100,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]));
  };

  return (
    <ScreenWrapper scrollable>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <AppText style={styles.headerTitle}>My Progress 📈</AppText>
                <AppText style={styles.headerSubtitle}>Track your learning journey</AppText>
              </View>
              <TouchableOpacity style={styles.timeFrameSelector}>
                <AppText style={styles.timeFrameText}>
                  {timeFrame === "week" ? "This Week" : 
                   timeFrame === "month" ? "This Month" : "All Time"}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Level Progress */}
            <View style={styles.levelCard}>
              <View style={styles.levelInfo}>
                <View style={styles.levelBadge}>
                  <AppText style={styles.levelNumber}>{stats.level}</AppText>
                </View>
                <View style={styles.levelText}>
                  <AppText style={styles.levelLabel}>Level {stats.level}</AppText>
                  <AppText style={styles.levelXP}>{stats.totalXP} / {stats.nextLevelXP} XP</AppText>
                </View>
              </View>
              <View style={styles.levelProgress}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { width: progressWidth }
                    ]} 
                  />
                </View>
                <AppText style={styles.progressPercent}>{stats.progress}%</AppText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["overview", "courses", "goals", "achievements"].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <AppText style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "overview" && (
            <>
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
                    <TrendingUp size={20} color={Colors.success} />
                  </View>
                  <AppText style={styles.statValue}>{stats.streak}</AppText>
                  <AppText style={styles.statLabel}>Day Streak</AppText>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
                    <BookOpen size={20} color={Colors.primary} />
                  </View>
                  <AppText style={styles.statValue}>{stats.completedLessons}</AppText>
                  <AppText style={styles.statLabel}>Lessons</AppText>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: Colors.warning + '20' }]}>
                    <Clock size={20} color={Colors.warning} />
                  </View>
                  <AppText style={styles.statValue}>{stats.totalHours}h</AppText>
                  <AppText style={styles.statLabel}>Hours</AppText>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: Colors.accent + '20' }]}>
                    <Zap size={20} color={Colors.accent} />
                  </View>
                  <AppText style={styles.statValue}>{stats.accuracy}%</AppText>
                  <AppText style={styles.statLabel}>Accuracy</AppText>
                </View>
              </View>

              {/* Weekly Progress Chart */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText style={styles.sectionTitle}>Weekly Activity</AppText>
                  <TouchableOpacity>
                    <AppText style={styles.sectionAction}>View Details →</AppText>
                  </TouchableOpacity>
                </View>
                <View style={styles.chartContainer}>
                  {weeklyProgress.map((day, index) => {
                    const maxLessons = getMaxValue(weeklyProgress, 'lessons');
                    const height = (day.lessons / maxLessons) * 100;
                    
                    return (
                      <View key={day.day} style={styles.chartColumn}>
                        <View style={styles.chartBarContainer}>
                          <View style={[styles.chartBar, { height: `${height}%` }]} />
                        </View>
                        <AppText style={styles.chartLabel}>{day.day}</AppText>
                        <AppText style={styles.chartValue}>{day.lessons}</AppText>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText style={styles.sectionTitle}>Recent Activity</AppText>
                </View>
                <View style={styles.activityList}>
                  {[
                    { time: "2 hours ago", action: "Completed JavaScript Quiz", xp: "+50 XP", icon: "📝" },
                    { time: "Yesterday", action: "Finished HTML Basics Course", xp: "+200 XP", icon: "🎓" },
                    { time: "2 days ago", action: "Earned Quick Learner badge", xp: "+100 XP", icon: "🏆" },
                    { time: "3 days ago", action: "Maintained 7-day streak", xp: "+150 XP", icon: "🔥" },
                  ].map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <AppText style={styles.activityEmoji}>{activity.icon}</AppText>
                      </View>
                      <View style={styles.activityContent}>
                        <AppText style={styles.activityAction}>{activity.action}</AppText>
                        <AppText style={styles.activityTime}>{activity.time}</AppText>
                      </View>
                      <View style={styles.activityXP}>
                        <AppText style={styles.xpText}>{activity.xp}</AppText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {activeTab === "courses" && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Course Progress</AppText>
              {coursesProgress.map((course, index) => (
                <View key={index} style={styles.courseProgressItem}>
                  <View style={styles.courseInfo}>
                    <View style={[styles.courseColor, { backgroundColor: course.color }]} />
                    <AppText style={styles.courseName}>{course.name}</AppText>
                  </View>
                  <View style={styles.courseProgress}>
                    <View style={styles.courseProgressBar}>
                      <View 
                        style={[
                          styles.courseProgressFill,
                          { width: `${course.progress}%`, backgroundColor: course.color }
                        ]} 
                      />
                    </View>
                    <AppText style={styles.courseProgressText}>{course.progress}%</AppText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "goals" && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Learning Goals</AppText>
              {goals.map((goal, index) => (
                <TouchableOpacity key={index} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <AppText style={styles.goalIcon}>{goal.icon}</AppText>
                    <View style={styles.goalInfo}>
                      <AppText style={styles.goalTitle}>{goal.title}</AppText>
                      <AppText style={styles.goalDeadline}>Deadline: {goal.deadline}</AppText>
                    </View>
                    <AppText style={styles.goalProgress}>{goal.progress}%</AppText>
                  </View>
                  <View style={styles.goalProgressBar}>
                    <View 
                      style={[
                        styles.goalProgressFill,
                        { width: `${goal.progress}%` }
                      ]} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === "achievements" && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Achievements</AppText>
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.achievementCard,
                      !achievement.earned && styles.achievementCardLocked
                    ]}
                  >
                    <View style={styles.achievementIcon}>
                      <AppText style={styles.achievementEmoji}>{achievement.icon}</AppText>
                      {!achievement.earned && (
                        <View style={styles.lockOverlay}>
                          <AppText style={styles.lockText}>🔒</AppText>
                        </View>
                      )}
                    </View>
                    <AppText style={styles.achievementTitle}>{achievement.title}</AppText>
                    <AppText style={styles.achievementDesc}>{achievement.description}</AppText>
                    <View style={styles.achievementStatus}>
                      <AppText style={[
                        styles.statusText,
                        achievement.earned ? styles.statusEarned : styles.statusLocked
                      ]}>
                        {achievement.earned ? "Earned" : "Locked"}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Insights */}
          <View style={styles.insightsCard}>
            <BarChart3 size={24} color={Colors.primary} />
            <AppText style={styles.insightsTitle}>Weekly Insights</AppText>
            <AppText style={styles.insightsText}>
              You're most productive on Saturdays! Try to maintain that energy throughout the week.
            </AppText>
          </View>
        </ScrollView>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  timeFrameSelector: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  timeFrameText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  levelCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  levelText: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  levelXP: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  levelProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statItem: {
    width: (width - 60) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
  },
  sectionAction: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  chartColumn: {
    alignItems: "center",
    flex: 1,
  },
  chartBarContainer: {
    height: 150,
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  chartBar: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 5,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  activityXP: {
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.success,
  },
  courseProgressItem: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  courseInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  courseColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  courseProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 15,
  },
  courseProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  courseProgressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: 12,
    color: Colors.textLight,
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  achievementEmoji: {
    fontSize: 24,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    fontSize: 20,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 10,
  },
  achievementStatus: {
    marginTop: "auto",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusEarned: {
    backgroundColor: Colors.success + "20",
    color: Colors.success,
  },
  statusLocked: {
    backgroundColor: Colors.borderLight,
    color: Colors.textLight,
  },
  insightsCard: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
    marginBottom: 10,
  },
  insightsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
});