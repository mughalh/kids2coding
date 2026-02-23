import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Award,
    CheckCircle,
    Clock,
    HelpCircle,
    Share2,
    Star,
    Target,
    Trophy,
    Users,
    Zap
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";

export default function DailyChallengeScreen() {
  const router = useRouter();
  
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [userProgress, setUserProgress] = useState({
    current: 0,
    total: 3,
  });

  const timerRef = useRef<NodeJS.Timeout>();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const challenge = {
    id: "daily-2024-01-30",
    title: "Array Master Challenge",
    description: "Solve 3 array manipulation problems in under 30 minutes",
    difficulty: "medium",
    category: "data-structures",
    reward: {
      xp: 150,
      streak: 1,
      badge: "daily-champion",
    },
    problems: [
      {
        id: "1",
        title: "Find Maximum",
        description: "Find the maximum number in an array",
        difficulty: "easy",
        points: 30,
        solved: false,
      },
      {
        id: "2",
        title: "Reverse Array",
        description: "Reverse the elements of an array",
        difficulty: "medium",
        points: 50,
        solved: false,
      },
      {
        id: "3",
        title: "Find Duplicates",
        description: "Find all duplicate numbers in an array",
        difficulty: "hard",
        points: 70,
        solved: false,
      },
    ],
    stats: {
      totalParticipants: 1250,
      completed: 420,
      averageTime: "18:45",
      successRate: 85,
    },
    expiresIn: "24 hours",
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: userProgress.current / userProgress.total,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [userProgress]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartChallenge = () => {
    setChallengeStarted(true);
    Alert.alert(
      "Challenge Started!",
      "You have 30 minutes to complete all 3 problems. Good luck!",
      [
        { 
          text: "Let's Go!", 
          onPress: () => router.push(`/challenges/${challenge.id}/problem/1`) 
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me in today's coding challenge on Kids 2 Coding! 🚀\n\nChallenge: ${challenge.title}\nReward: ${challenge.reward.xp} XP\n\nCan you beat my score?`,
        url: 'https://kids2coding.com/daily-challenge',
        title: 'Daily Coding Challenge',
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share challenge");
    }
  };

  const handleCompleteProblem = (problemId: string) => {
    const updatedProblems = challenge.problems.map(p => 
      p.id === problemId ? { ...p, solved: true } : p
    );
    
    const solvedCount = updatedProblems.filter(p => p.solved).length;
    setUserProgress({
      current: solvedCount,
      total: challenge.problems.length,
    });

    if (solvedCount === challenge.problems.length) {
      setChallengeCompleted(true);
      Alert.alert(
        "🎉 Challenge Completed!",
        `Congratulations! You earned ${challenge.reward.xp} XP and maintained your streak!`,
        [
          { text: "Claim Rewards", onPress: handleClaimRewards },
          { text: "Share", onPress: handleShare },
        ]
      );
    }
  };

  const handleClaimRewards = () => {
    Alert.alert(
      "Rewards Claimed!",
      `+${challenge.reward.xp} XP\n+1 Day Streak\n🔥 Daily Champion Badge`,
      [
        { 
          text: "Continue Learning", 
          onPress: () => router.push("/dashboard") 
        }
      ]
    );
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScreenWrapper scrollable>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <AppText style={styles.title}>Daily Challenge 🎯</AppText>
              <AppText style={styles.subtitle}>New challenge every day at midnight</AppText>
            </View>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Share2 size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Clock size={20} color={Colors.warning} />
              <AppText style={styles.timerTitle}>Time Remaining</AppText>
            </View>
            <AppText style={styles.timerValue}>{formatTime(timeLeft)}</AppText>
            <AppText style={styles.timerLabel}>Challenge resets in {formatTime(timeLeft)}</AppText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Info */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeBadge}>
              <Target size={20} color={Colors.primary} />
              <AppText style={styles.challengeBadgeText}>Daily</AppText>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: 
                challenge.difficulty === 'easy' ? Colors.success + '20' :
                challenge.difficulty === 'medium' ? Colors.warning + '20' :
                Colors.error + '20'
              }
            ]}>
              <AppText style={[
                styles.difficultyText,
                { color: 
                  challenge.difficulty === 'easy' ? Colors.success :
                  challenge.difficulty === 'medium' ? Colors.warning :
                  Colors.error
                }
              ]}>
                {challenge.difficulty.toUpperCase()}
              </AppText>
            </View>
          </View>

          <AppText style={styles.challengeTitle}>{challenge.title}</AppText>
          <AppText style={styles.challengeDescription}>
            {challenge.description}
          </AppText>

          <View style={styles.rewards}>
            <View style={styles.rewardItem}>
              <Zap size={16} color={Colors.warning} />
              <AppText style={styles.rewardText}>+{challenge.reward.xp} XP</AppText>
            </View>
            <View style={styles.rewardItem}>
              <AppText style={styles.rewardIcon}>🔥</AppText>
              <AppText style={styles.rewardText}>+{challenge.reward.streak} Day</AppText>
            </View>
            <View style={styles.rewardItem}>
              <Award size={16} color={Colors.primary} />
              <AppText style={styles.rewardText}>Badge</AppText>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <AppText style={styles.progressTitle}>Your Progress</AppText>
            <AppText style={styles.progressCount}>
              {userProgress.current}/{userProgress.total}
            </AppText>
          </View>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: progressWidth }
              ]} 
            />
          </View>
          <AppText style={styles.progressText}>
            {challengeCompleted 
              ? "🎉 Challenge Completed!" 
              : "Complete all problems to earn rewards"}
          </AppText>
        </View>

        {/* Problems */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Problems ({challenge.problems.length})</AppText>
            <TouchableOpacity>
              <AppText style={styles.seeAll}>How to Solve →</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.problemsList}>
            {challenge.problems.map((problem, index) => (
              <TouchableOpacity
                key={problem.id}
                style={[
                  styles.problemCard,
                  problem.solved && styles.problemCardSolved
                ]}
                onPress={() => router.push(`/challenges/${challenge.id}/problem/${problem.id}`)}
              >
                <View style={styles.problemNumber}>
                  <AppText style={styles.problemNumberText}>{index + 1}</AppText>
                </View>
                <View style={styles.problemInfo}>
                  <View style={styles.problemHeader}>
                    <AppText style={styles.problemTitle}>{problem.title}</AppText>
                    <View style={styles.pointsBadge}>
                      <Star size={12} color={Colors.warning} />
                      <AppText style={styles.pointsText}>{problem.points} pts</AppText>
                    </View>
                  </View>
                  <AppText style={styles.problemDescription}>
                    {problem.description}
                  </AppText>
                  <View style={styles.problemFooter}>
                    <View style={[
                      styles.difficultyTag,
                      { backgroundColor: 
                        problem.difficulty === 'easy' ? Colors.success + '20' :
                        problem.difficulty === 'medium' ? Colors.warning + '20' :
                        Colors.error + '20'
                      }
                    ]}>
                      <AppText style={[
                        styles.difficultyTagText,
                        { color: 
                          problem.difficulty === 'easy' ? Colors.success :
                          problem.difficulty === 'medium' ? Colors.warning :
                          Colors.error
                        }
                      ]}>
                        {problem.difficulty}
                      </AppText>
                    </View>
                    {problem.solved && (
                      <View style={styles.solvedBadge}>
                        <CheckCircle size={16} color={Colors.success} />
                        <AppText style={styles.solvedText}>Solved</AppText>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Users size={20} color={Colors.primary} />
            <AppText style={styles.statsTitle}>Today's Stats</AppText>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <AppText style={styles.statValueLarge}>{challenge.stats.totalParticipants}</AppText>
              <AppText style={styles.statLabel}>Participants</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statValueLarge}>{challenge.stats.completed}</AppText>
              <AppText style={styles.statLabel}>Completed</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statValueLarge}>{challenge.stats.averageTime}</AppText>
              <AppText style={styles.statLabel}>Avg. Time</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statValueLarge}>{challenge.stats.successRate}%</AppText>
              <AppText style={styles.statLabel}>Success Rate</AppText>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <HelpCircle size={20} color={Colors.warning} />
            <AppText style={styles.tipsTitle}>Tips for Success</AppText>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <AppText style={styles.tipIcon}>💡</AppText>
              <AppText style={styles.tipText}>Read the problem carefully before starting</AppText>
            </View>
            <View style={styles.tipItem}>
              <AppText style={styles.tipIcon}>⏱️</AppText>
              <AppText style={styles.tipText}>Manage your time - you have 30 minutes total</AppText>
            </View>
            <View style={styles.tipItem}>
              <AppText style={styles.tipIcon}>🔧</AppText>
              <AppText style={styles.tipText}>Test your solution with different inputs</AppText>
            </View>
            <View style={styles.tipItem}>
              <AppText style={styles.tipIcon}>🏆</AppText>
              <AppText style={styles.tipText}>Complete all problems for maximum rewards</AppText>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {!challengeCompleted ? (
          <TouchableOpacity 
            style={[
              styles.startButton,
              challengeStarted && styles.continueButton
            ]}
            onPress={handleStartChallenge}
          >
            <View style={styles.buttonContent}>
              <Target size={24} color="white" />
              <View style={styles.buttonText}>
                <AppText style={styles.buttonTitle}>
                  {challengeStarted ? "Continue Challenge" : "Start Challenge"}
                </AppText>
                <AppText style={styles.buttonSubtitle}>
                  {challengeStarted 
                    ? `${userProgress.current}/${userProgress.total} problems solved`
                    : "30 minutes • 3 problems"
                  }
                </AppText>
              </View>
            </View>
            <AppText style={styles.buttonArrow}>→</AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.completedButton}
            onPress={handleClaimRewards}
          >
            <Trophy size={24} color={Colors.warning} />
            <AppText style={styles.completedText}>🎉 Challenge Completed!</AppText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 40,
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  shareButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  timerCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timerTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  timerLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
    marginTop: -30,
  },
  challengeCard: {
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
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  challengeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  challengeBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  challengeDescription: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
    marginBottom: 20,
  },
  rewards: {
    flexDirection: "row",
    gap: 15,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rewardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 6,
  },
  progressSection: {
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
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  progressCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
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
  progressText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
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
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  problemsList: {
    gap: 15,
  },
  problemCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  problemCardSolved: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  problemNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  problemNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  problemInfo: {
    flex: 1,
  },
  problemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.warning,
    marginLeft: 4,
  },
  problemDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 20,
  },
  problemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyTagText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  solvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  solvedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.success,
    marginLeft: 4,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 15,
  },
  statValueLarge: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  tipsCard: {
    backgroundColor: Colors.warning + "10",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 10,
  },
  tipsList: {
    gap: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.success,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    flex: 1,
    marginLeft: 15,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  buttonArrow: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  completedButton: {
    backgroundColor: Colors.warning,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  completedText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
});