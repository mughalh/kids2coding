import { useRouter } from "expo-router";
import { Award, Calendar, Clock, Target, TrendingUp, Trophy, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";

export default function ChallengesScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    daily: 86400, // 24 hours
    weekly: 604800, // 7 days
  });

  const challenges = {
    daily: [
      {
        id: "daily-1",
        title: "Quick Thinker",
        description: "Solve 3 puzzles in under 10 minutes",
        reward: { type: "xp", value: 50 },
        completed: true,
        progress: { current: 3, total: 3 },
        emoji: "⚡",
      },
      {
        id: "daily-2",
        title: "Early Bird",
        description: "Complete a lesson before 9 AM",
        reward: { type: "badge", value: "early-bird" },
        completed: false,
        progress: { current: 0, total: 1 },
        emoji: "🌅",
      },
      {
        id: "daily-3",
        title: "Code Marathon",
        description: "Code for 30 minutes straight",
        reward: { type: "xp", value: 100 },
        completed: false,
        progress: { current: 15, total: 30 },
        emoji: "🏃‍♂️",
      },
    ],
    weekly: [
      {
        id: "weekly-1",
        title: "Master Learner",
        description: "Complete 5 lessons this week",
        reward: { type: "xp", value: 500 },
        completed: false,
        progress: { current: 2, total: 5 },
        emoji: "🎓",
      },
      {
        id: "weekly-2",
        title: "Puzzle Master",
        description: "Solve 10 puzzles",
        reward: { type: "badge", value: "puzzle-master" },
        completed: false,
        progress: { current: 6, total: 10 },
        emoji: "🧩",
      },
      {
        id: "weekly-3",
        title: "Perfect Week",
        description: "Maintain 7-day learning streak",
        reward: { type: "xp", value: 1000 },
        completed: false,
        progress: { current: 3, total: 7 },
        emoji: "🔥",
      },
    ],
    special: [
      {
        id: "special-1",
        title: "First Project",
        description: "Build and submit your first coding project",
        reward: { type: "badge", value: "first-project" },
        completed: false,
        deadline: "2024-01-31",
        emoji: "🚀",
      },
      {
        id: "special-2",
        title: "Community Helper",
        description: "Help 3 other learners in the forum",
        reward: { type: "xp", value: 300 },
        completed: false,
        deadline: "No deadline",
        emoji: "🤝",
      },
    ],
  };

  const stats = {
    streak: 7,
    totalChallenges: 12,
    completedChallenges: 4,
    totalXP: 1250,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => ({
        daily: Math.max(0, prev.daily - 1),
        weekly: Math.max(0, prev.weekly - 1),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${secs}s`;
  };

  const ChallengeCard = ({ challenge, type }: any) => (
    <TouchableOpacity
      style={[
        styles.challengeCard,
        challenge.completed && styles.challengeCardCompleted,
      ]}
      onPress={() => router.push(`/challenges/${challenge.id}`)}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeEmojiContainer}>
          <AppText style={styles.challengeEmoji}>{challenge.emoji}</AppText>
        </View>
        <View style={styles.challengeInfo}>
          <AppText style={styles.challengeTitle}>{challenge.title}</AppText>
          <AppText style={styles.challengeDescription}>{challenge.description}</AppText>
        </View>
        <View style={styles.rewardBadge}>
          {challenge.reward.type === "xp" ? (
            <Zap size={16} color={Colors.warning} />
          ) : (
            <Award size={16} color={Colors.primary} />
          )}
          <AppText style={styles.rewardText}>
            {challenge.reward.type === "xp" ? `${challenge.reward.value} XP` : "Badge"}
          </AppText>
        </View>
      </View>

      {challenge.progress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(challenge.progress.current / challenge.progress.total) * 100}%`,
                  backgroundColor: challenge.completed ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>
          <AppText style={styles.progressText}>
            {challenge.progress.current}/{challenge.progress.total}
          </AppText>
        </View>
      )}

      {challenge.deadline && (
        <View style={styles.deadline}>
          <Calendar size={14} color={Colors.textLight} />
          <AppText style={styles.deadlineText}>Deadline: {challenge.deadline}</AppText>
        </View>
      )}

      {challenge.completed && (
        <View style={styles.completedOverlay}>
          <AppText style={styles.completedText}>Completed! 🎉</AppText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper scrollable>
      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Target size={24} color="white" />
            <AppText style={styles.statValue}>{stats.totalChallenges}</AppText>
            <AppText style={styles.statLabel}>Challenges</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Trophy size={24} color="white" />
            <AppText style={styles.statValue}>{stats.completedChallenges}</AppText>
            <AppText style={styles.statLabel}>Completed</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Zap size={24} color="white" />
            <AppText style={styles.statValue}>{stats.totalXP}</AppText>
            <AppText style={styles.statLabel}>XP Earned</AppText>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        {/* Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <TrendingUp size={24} color={Colors.warning} />
            </View>
            <View style={styles.streakInfo}>
              <AppText style={styles.streakTitle}>🔥 Current Streak</AppText>
              <AppText style={styles.streakValue}>{stats.streak} days</AppText>
            </View>
          </View>
          <AppText style={styles.streakText}>Keep going! 3 more days for a badge!</AppText>
        </View>

        {/* Timers */}
        <View style={styles.timers}>
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Clock size={20} color={Colors.primary} />
              <AppText style={styles.timerTitle}>Daily Reset</AppText>
            </View>
            <AppText style={styles.timerValue}>{formatTime(timeLeft.daily)}</AppText>
          </View>
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Calendar size={20} color={Colors.accent} />
              <AppText style={styles.timerTitle}>Weekly Reset</AppText>
            </View>
            <AppText style={styles.timerValue}>{formatTime(timeLeft.weekly)}</AppText>
          </View>
        </View>

        {/* Daily Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Today's Challenges ☀️</AppText>
            <AppText style={styles.sectionSubtitle}>Resets in {formatTime(timeLeft.daily)}</AppText>
          </View>
          {challenges.daily.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} type="daily" />
          ))}
        </View>

        {/* Weekly Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Weekly Challenges 📅</AppText>
            <AppText style={styles.sectionSubtitle}>Resets in {formatTime(timeLeft.weekly)}</AppText>
          </View>
          {challenges.weekly.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} type="weekly" />
          ))}
        </View>

        {/* Special Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Special Challenges ⭐</AppText>
          </View>
          {challenges.special.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} type="special" />
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
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
  streakCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  streakIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.warning + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  streakText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: "italic",
  },
  timers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  timerCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timerTitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  challengeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.border,
    position: "relative",
  },
  challengeCardCompleted: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  challengeEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  challengeEmoji: {
    fontSize: 20,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rewardText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "right",
  },
  deadline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  deadlineText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.textLight,
  },
  completedOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 13,
  },
  completedText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
});