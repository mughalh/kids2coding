import { useRouter } from "expo-router";
import { Lock, Star, Target, Trophy, Zap } from "lucide-react-native";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";

const { width } = Dimensions.get("window");

export default function BadgesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const badges = [
    {
      id: "1",
      name: "Code Newbie",
      description: "Complete your first coding lesson",
      category: "learning",
      rarity: "common",
      earned: true,
      dateEarned: "2024-01-10",
      icon: "👶",
      xp: 50,
    },
    {
      id: "2",
      name: "Quick Learner",
      description: "Complete 5 lessons in one day",
      category: "learning",
      rarity: "rare",
      earned: true,
      dateEarned: "2024-01-12",
      icon: "⚡",
      xp: 100,
    },
    {
      id: "3",
      name: "Perfect Score",
      description: "Get 100% on 3 quizzes",
      category: "quizzes",
      rarity: "epic",
      earned: false,
      requirements: { quizzes: 3, score: 100 },
      icon: "💯",
      xp: 200,
    },
    {
      id: "4",
      name: "Weekend Warrior",
      description: "Learn for 5 hours on a weekend",
      category: "time",
      rarity: "rare",
      earned: false,
      requirements: { hours: 5, days: ["Sat", "Sun"] },
      icon: "🏋️‍♂️",
      xp: 150,
    },
    {
      id: "5",
      name: "7-Day Streak",
      description: "Maintain a 7-day learning streak",
      category: "streak",
      rarity: "rare",
      earned: true,
      dateEarned: "2024-01-18",
      icon: "🔥",
      xp: 100,
    },
    {
      id: "6",
      name: "Course Master",
      description: "Complete 3 full courses",
      category: "courses",
      rarity: "legendary",
      earned: false,
      requirements: { courses: 3, complete: true },
      icon: "🎓",
      xp: 500,
    },
    {
      id: "7",
      name: "Bug Hunter",
      description: "Fix 10 bugs in coding exercises",
      category: "practice",
      rarity: "common",
      earned: false,
      requirements: { bugs: 10 },
      icon: "🐛",
      xp: 75,
    },
    {
      id: "8",
      name: "Community Helper",
      description: "Help 5 other learners",
      category: "community",
      rarity: "epic",
      earned: true,
      dateEarned: "2024-01-15",
      icon: "🤝",
      xp: 250,
    },
  ];

  const categories = [
    { id: "all", label: "All Badges", emoji: "🏆" },
    { id: "learning", label: "Learning", emoji: "📚" },
    { id: "quizzes", label: "Quizzes", emoji: "📝" },
    { id: "streak", label: "Streaks", emoji: "🔥" },
    { id: "courses", label: "Courses", emoji: "🎓" },
    { id: "practice", label: "Practice", emoji: "💪" },
    { id: "community", label: "Community", emoji: "👥" },
  ];

  const rarityColors: { [key: string]: string } = {
    common: Colors.textLight,
    rare: Colors.success,
    epic: Colors.primary,
    legendary: Colors.warning,
  };

  const stats = {
    total: badges.length,
    earned: badges.filter(b => b.earned).length,
    totalXP: badges.filter(b => b.earned).reduce((sum, b) => sum + b.xp, 0),
    completion: Math.round((badges.filter(b => b.earned).length / badges.length) * 100),
  };

  const filteredBadges = badges.filter(badge => {
    const matchesCategory = selectedCategory === "all" || badge.category === selectedCategory;
    const matchesEarned = !showEarnedOnly || badge.earned;
    return matchesCategory && matchesEarned;
  });

  const getRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  return (
    <ScreenWrapper scrollable>
      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Trophy size={24} color="white" />
            <AppText style={styles.statValue}>{stats.earned}/{stats.total}</AppText>
            <AppText style={styles.statLabel}>Badges</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Zap size={24} color="white" />
            <AppText style={styles.statValue}>{stats.totalXP}</AppText>
            <AppText style={styles.statLabel}>XP Earned</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Star size={24} color="white" />
            <AppText style={styles.statValue}>{stats.completion}%</AppText>
            <AppText style={styles.statLabel}>Complete</AppText>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        {/* Categories */}
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

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowEarnedOnly(!showEarnedOnly)}
        >
          <View style={[
            styles.toggleCircle,
            showEarnedOnly && styles.toggleCircleActive
          ]}>
            {showEarnedOnly && <View style={styles.toggleDot} />}
          </View>
          <AppText style={styles.toggleText}>Show earned badges only</AppText>
        </TouchableOpacity>

        {/* Badges Grid */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.badgesGrid}>
            {filteredBadges.map(badge => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.earned && styles.badgeCardLocked
                ]}
                onPress={() => router.push(`/badges/${badge.id}`)}
              >
                {/* Badge Icon */}
                <View style={[
                  styles.badgeIconContainer,
                  { borderColor: rarityColors[badge.rarity] }
                ]}>
                  <AppText style={styles.badgeIcon}>{badge.icon}</AppText>
                  {!badge.earned && (
                    <View style={styles.lockOverlay}>
                      <Lock size={20} color="white" />
                    </View>
                  )}
                </View>

                {/* Badge Info */}
                <View style={styles.badgeInfo}>
                  <View style={styles.badgeHeader}>
                    <AppText style={styles.badgeName}>{badge.name}</AppText>
                    <View style={[
                      styles.rarityBadge,
                      { backgroundColor: rarityColors[badge.rarity] + '20' }
                    ]}>
                      <AppText style={[
                        styles.rarityText,
                        { color: rarityColors[badge.rarity] }
                      ]}>
                        {getRarityLabel(badge.rarity)}
                      </AppText>
                    </View>
                  </View>
                  
                  <AppText style={styles.badgeDescription}>{badge.description}</AppText>

                  {badge.earned ? (
                    <View style={styles.earnedInfo}>
                      <View style={styles.xpBadge}>
                        <Zap size={12} color={Colors.warning} />
                        <AppText style={styles.xpText}>+{badge.xp} XP</AppText>
                      </View>
                      <AppText style={styles.dateEarned}>
                        Earned on {badge.dateEarned}
                      </AppText>
                    </View>
                  ) : (
                    <View style={styles.requirements}>
                      <AppText style={styles.requirementsTitle}>Requirements:</AppText>
                      {badge.requirements && (
                        <View style={styles.requirementsList}>
                          {Object.entries(badge.requirements).map(([key, value]) => (
                            <AppText key={key} style={styles.requirement}>
                              • {key}: {value}
                            </AppText>
                          ))}
                        </View>
                      )}
                      <View style={styles.xpReward}>
                        <Zap size={12} color={Colors.warning} />
                        <AppText style={styles.xpRewardText}>
                          Reward: {badge.xp} XP
                        </AppText>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <AppText style={styles.progressTitle}>Badge Progress</AppText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${stats.completion}%` }
                ]} 
              />
            </View>
            <View style={styles.progressStats}>
              <AppText style={styles.progressText}>
                {stats.earned} of {stats.total} badges earned
              </AppText>
              <AppText style={styles.progressPercent}>{stats.completion}%</AppText>
            </View>
          </View>

          {/* Next Badge */}
          <View style={styles.nextBadgeCard}>
            <View style={styles.nextBadgeHeader}>
              <Target size={20} color={Colors.primary} />
              <AppText style={styles.nextBadgeTitle}>Next Badge to Earn</AppText>
            </View>
            <View style={styles.nextBadgeContent}>
              <View style={styles.nextBadgeIcon}>
                <AppText style={styles.nextBadgeEmoji}>💯</AppText>
              </View>
              <View style={styles.nextBadgeInfo}>
                <AppText style={styles.nextBadgeName}>Perfect Score</AppText>
                <AppText style={styles.nextBadgeDesc}>
                  Get 100% on 3 quizzes. Progress: 2/3
                </AppText>
                <View style={styles.nextBadgeProgress}>
                  <View style={styles.nextProgressBar}>
                    <View style={[styles.nextProgressFill, { width: '67%' }]} />
                  </View>
                  <AppText style={styles.nextProgressText}>67%</AppText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statsBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  categories: {
    marginBottom: 20,
  },
  category: {
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textLight,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  toggleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  badgesGrid: {
    gap: 15,
    marginBottom: 30,
  },
  badgeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeCardLocked: {
    opacity: 0.8,
  },
  badgeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    position: "relative",
  },
  badgeIcon: {
    fontSize: 36,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeInfo: {
    flex: 1,
  },
  badgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 15,
    lineHeight: 20,
  },
  earnedInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  xpText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.warning,
  },
  dateEarned: {
    fontSize: 12,
    color: Colors.textLight,
  },
  requirements: {
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  requirementsList: {
    marginBottom: 10,
  },
  requirement: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 2,
  },
  xpReward: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpRewardText: {
    marginLeft: 5,
    fontSize: 11,
    color: Colors.warning,
    fontWeight: "600",
  },
  progressSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  nextBadgeCard: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 20,
    padding: 20,
  },
  nextBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  nextBadgeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 10,
  },
  nextBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextBadgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  nextBadgeEmoji: {
    fontSize: 28,
  },
  nextBadgeInfo: {
    flex: 1,
  },
  nextBadgeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  nextBadgeDesc: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  nextBadgeProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 15,
  },
  nextProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  nextProgressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
});