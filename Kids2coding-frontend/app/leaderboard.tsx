import { useRouter } from "expo-router";
import {
    Crown,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users
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

export default function LeaderboardScreen() {
  const router = useRouter();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("weekly");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const leaderboardData = [
    {
      id: "1",
      rank: 1,
      name: "Alex Johnson",
      avatar: "👨‍💻",
      xp: 5240,
      level: 8,
      streak: 21,
      completed: 48,
      badges: 12,
      isYou: false,
      change: "up",
    },
    {
      id: "2",
      rank: 2,
      name: "Sarah Miller",
      avatar: "👩‍🎨",
      xp: 4890,
      level: 7,
      streak: 18,
      completed: 42,
      badges: 10,
      isYou: false,
      change: "same",
    },
    {
      id: "3",
      rank: 3,
      name: "Mike Chen",
      avatar: "👨‍🔬",
      xp: 4560,
      level: 7,
      streak: 14,
      completed: 38,
      badges: 9,
      isYou: false,
      change: "up",
    },
    {
      id: "4",
      rank: 4,
      name: "You",
      avatar: "😎",
      xp: 4320,
      level: 6,
      streak: 7,
      completed: 35,
      badges: 8,
      isYou: true,
      change: "down",
    },
    {
      id: "5",
      rank: 5,
      name: "Tech Wizards",
      avatar: "🧙‍♂️",
      xp: 3980,
      level: 6,
      streak: 12,
      completed: 32,
      badges: 7,
      isYou: false,
      change: "up",
    },
    {
      id: "6",
      rank: 6,
      name: "Code Ninja",
      avatar: "🥷",
      xp: 3650,
      level: 5,
      streak: 9,
      completed: 28,
      badges: 6,
      isYou: false,
      change: "same",
    },
    {
      id: "7",
      rank: 7,
      name: "Pixel Perfect",
      avatar: "🎨",
      xp: 3420,
      level: 5,
      streak: 5,
      completed: 25,
      badges: 5,
      isYou: false,
      change: "down",
    },
    {
      id: "8",
      rank: 8,
      name: "Data Master",
      avatar: "📊",
      xp: 3120,
      level: 4,
      streak: 3,
      completed: 22,
      badges: 4,
      isYou: false,
      change: "up",
    },
  ];

  const timeFrames = [
    { id: "daily", label: "Today" },
    { id: "weekly", label: "This Week" },
    { id: "monthly", label: "This Month" },
    { id: "all", label: "All Time" },
  ];

  const categories = [
    { id: "all", label: "All", emoji: "🏆" },
    { id: "xp", label: "XP", emoji: "⚡" },
    { id: "streak", label: "Streak", emoji: "🔥" },
    { id: "lessons", label: "Lessons", emoji: "📚" },
    { id: "badges", label: "Badges", emoji: "🎖️" },
  ];

  const stats = {
    yourRank: 4,
    totalUsers: 1250,
    topPercent: 0.32,
    pointsToNext: 120,
    averageXP: 2850,
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return Colors.warning;
      case 2: return Colors.textLight;
      case 3: return Colors.secondary;
      default: return Colors.text;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "👑";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${rank}`;
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up": return "↗️";
      case "down": return "↘️";
      default: return "➡️";
    }
  };

  return (
    <ScreenWrapper scrollable>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <AppText style={styles.title}>Leaderboard 🏆</AppText>
              <AppText style={styles.subtitle}>Compete with learners worldwide</AppText>
            </View>
            <View style={styles.statsBadge}>
              <Trophy size={20} color={Colors.warning} />
              <AppText style={styles.rankText}>Rank #{stats.yourRank}</AppText>
            </View>
          </View>

          {/* Time Frame Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeFrames}
          >
            {timeFrames.map(frame => (
              <TouchableOpacity
                key={frame.id}
                style={[
                  styles.timeFrame,
                  selectedTimeFrame === frame.id && styles.timeFrameActive
                ]}
                onPress={() => setSelectedTimeFrame(frame.id)}
              >
                <AppText style={[
                  styles.timeFrameText,
                  selectedTimeFrame === frame.id && styles.timeFrameTextActive
                ]}>
                  {frame.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filters */}
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
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={20} color={Colors.primary} />
            <AppText style={styles.statValue}>{stats.totalUsers}</AppText>
            <AppText style={styles.statLabel}>Total Learners</AppText>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.success} />
            <AppText style={styles.statValue}>Top {stats.topPercent}%</AppText>
            <AppText style={styles.statLabel}>Your Position</AppText>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color={Colors.accent} />
            <AppText style={styles.statValue}>{stats.pointsToNext} XP</AppText>
            <AppText style={styles.statLabel}>To Next Rank</AppText>
          </View>
          <View style={styles.statCard}>
            <Star size={20} color={Colors.warning} />
            <AppText style={styles.statValue}>{stats.averageXP}</AppText>
            <AppText style={styles.statLabel}>Avg. XP</AppText>
          </View>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podium}>
          {leaderboardData
            .filter(user => user.rank <= 3)
            .sort((a, b) => a.rank - b.rank)
            .map(user => (
              <View 
                key={user.id} 
                style={[
                  styles.podiumPlace,
                  user.rank === 1 && styles.firstPlace,
                  user.rank === 2 && styles.secondPlace,
                  user.rank === 3 && styles.thirdPlace,
                ]}
              >
                <View style={styles.podiumRank}>
                  <AppText style={[
                    styles.podiumRankText,
                    { color: getRankColor(user.rank) }
                  ]}>
                    {getRankIcon(user.rank)}
                  </AppText>
                </View>
                <View style={styles.podiumAvatar}>
                  <AppText style={styles.podiumAvatarText}>{user.avatar}</AppText>
                </View>
                <AppText style={styles.podiumName} numberOfLines={1}>
                  {user.name}
                </AppText>
                <View style={styles.podiumXP}>
                  <Zap size={12} color={Colors.warning} />
                  <AppText style={styles.podiumXPText}>{user.xp} XP</AppText>
                </View>
                {user.rank === 1 && (
                  <View style={styles.crown}>
                    <Crown size={16} color={Colors.warning} />
                  </View>
                )}
              </View>
            ))}
        </View>

        {/* Leaderboard List */}
        <ScrollView style={styles.leaderboardList}>
          {leaderboardData.map(user => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.leaderboardItem,
                user.isYou && styles.yourItem
              ]}
              onPress={() => router.push(`/profile/${user.id}`)}
            >
              <View style={styles.rankContainer}>
                <AppText style={[
                  styles.rank,
                  { color: getRankColor(user.rank) }
                ]}>
                  {user.rank}
                </AppText>
                <View style={styles.changeIndicator}>
                  <AppText style={styles.changeIcon}>
                    {getChangeIcon(user.change)}
                  </AppText>
                </View>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <AppText style={styles.avatar}>{user.avatar}</AppText>
                  {user.isYou && (
                    <View style={styles.youBadge}>
                      <AppText style={styles.youText}>YOU</AppText>
                    </View>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <AppText style={[
                    styles.userName,
                    user.isYou && styles.yourName
                  ]}>
                    {user.name}
                  </AppText>
                  <View style={styles.userStats}>
                    <View style={styles.stat}>
                      <AppText style={styles.statIcon}>⚡</AppText>
                      <AppText style={styles.statValueSmall}>{user.xp} XP</AppText>
                    </View>
                    <View style={styles.stat}>
                      <AppText style={styles.statIcon}>🔥</AppText>
                      <AppText style={styles.statValueSmall}>{user.streak} days</AppText>
                    </View>
                    <View style={styles.stat}>
                      <AppText style={styles.statIcon}>🎖️</AppText>
                      <AppText style={styles.statValueSmall}>{user.badges}</AppText>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.levelBadge}>
                <AppText style={styles.levelText}>Lvl {user.level}</AppText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Your Stats */}
        <View style={styles.yourStats}>
          <View style={styles.yourStatsHeader}>
            <AppText style={styles.yourStatsTitle}>Your Progress</AppText>
            <TouchableOpacity>
              <AppText style={styles.seeMore}>See More →</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBars}>
            <View style={styles.progressBar}>
              <View style={styles.progressLabel}>
                <AppText style={styles.progressName}>Rank Progress</AppText>
                <AppText style={styles.progressPercent}>32%</AppText>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: '32%' }]} />
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressLabel}>
                <AppText style={styles.progressName}>Next Level</AppText>
                <AppText style={styles.progressPercent}>68%</AppText>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: '68%' }]} />
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
}

// Helper component for Zap icon
const Zap = ({ size, color }: { size: number; color: string }) => (
  <AppText style={{ fontSize: size, color }}>⚡</AppText>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 5,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rankText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.warning,
  },
  timeFrames: {
    marginBottom: 15,
  },
  timeFrame: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    marginRight: 10,
  },
  timeFrameActive: {
    backgroundColor: Colors.primary,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  timeFrameTextActive: {
    color: "white",
  },
  categories: {
    marginBottom: 20,
  },
  category: {
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  categoryTextActive: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: "center",
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: Colors.background,
  },
  podiumPlace: {
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    position: "relative",
    marginHorizontal: 5,
  },
  firstPlace: {
    backgroundColor: Colors.warning + "20",
    paddingTop: 40,
    marginBottom: -20,
  },
  secondPlace: {
    backgroundColor: Colors.textLight + "20",
    paddingTop: 30,
    marginBottom: -10,
  },
  thirdPlace: {
    backgroundColor: Colors.secondary + "20",
    paddingTop: 20,
  },
  podiumRank: {
    marginBottom: 10,
  },
  podiumRankText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  podiumAvatarText: {
    fontSize: 28,
  },
  podiumName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
    maxWidth: 100,
  },
  podiumXP: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  podiumXPText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.text,
  },
  crown: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  yourItem: {
    backgroundColor: Colors.primary + "10",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rankContainer: {
    alignItems: "center",
    marginRight: 15,
  },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  changeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  changeIcon: {
    fontSize: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    textAlign: "center",
    lineHeight: 40,
  },
  youBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youText: {
    fontSize: 8,
    color: "white",
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 5,
  },
  yourName: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  userStats: {
    flexDirection: "row",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statValueSmall: {
    fontSize: 12,
    color: Colors.textLight,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  yourStats: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  yourStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  yourStatsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  seeMore: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  progressBars: {
    gap: 15,
  },
  progressBar: {
    marginBottom: 10,
  },
  progressLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressName: {
    fontSize: 14,
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  bar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});