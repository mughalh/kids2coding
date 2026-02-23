import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, TrendingUp, Target, Zap, BookOpen, Compass, Sparkles, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';

const { width } = Dimensions.get('window');

interface ProgressCardProps {
  onPress?: () => void;
  showDetails?: boolean;
}

// Rotating learning tips
const LEARNING_TIPS = [
  { tip: "💡 Practice 15 minutes daily for best results", emoji: "⏰" },
  { tip: "🚀 Complete lessons in order to build strong foundations", emoji: "📚" },
  { tip: "🎯 Take quizzes to earn bonus XP", emoji: "⭐" },
  { tip: "🔥 Maintain your streak for special badges", emoji: "🏆" },
  { tip: "🤖 Ask AI Buddy when you're stuck", emoji: "🤖" },
  { tip: "🎮 Try coding games to practice skills", emoji: "🕹️" },
  { tip: "📝 Review completed lessons to reinforce learning", emoji: "🔄" },
  { tip: "🌟 Challenge yourself with daily puzzles", emoji: "🧩" },
];

export const ProgressCard: React.FC<ProgressCardProps> = ({
  onPress,
  showDetails = true,
}) => {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const { courses, loading: coursesLoading } = useCourses();
  
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showRoadmap, setShowRoadmap] = useState(true);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const tipFadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate user stats
  const userLevel = Math.floor((progress?.totalXP || 0) / 100) + 1;
  const levelProgress = ((progress?.totalXP || 0) % 100);
  
  // Calculate course progress
  const enrolledCourses = progress?.enrolledCourses || [];
  const completedLessons = progress?.completedLessons || {};
  
  // Count total lessons completed
  const totalLessonsCompleted = Object.values(completedLessons).reduce(
    (acc: number, lessons: any) => acc + (lessons?.length || 0), 
    0
  );
  
  // Count total quizzes taken
  let totalQuizzesTaken = 0;
  const quizScores = progress?.quizScores || {};
  Object.values(quizScores).forEach((courseQuizzes: any) => {
    totalQuizzesTaken += Object.keys(courseQuizzes || {}).length;
  });
  
  const totalBadges = progress?.earnedBadges?.length || 0;
  const streak = progress?.streak || 0;
  
  // Calculate overall progress percentage
  const totalLessonsAvailable = courses?.reduce((acc, course) => acc + (course.lessonsCount || 0), 0) || 1;
  const overallProgress = Math.min(
    Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100),
    100
  );

  // Rotate tips every 5 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      // Fade out
      Animated.timing(tipFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change tip
        setCurrentTipIndex((prev) => (prev + 1) % LEARNING_TIPS.length);
        // Fade in
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: overallProgress,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Card entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overallProgress]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '0deg'],
  });

  // Loading state
  if (progressLoading || coursesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Loading your progress...</AppText>
      </View>
    );
  }

  const CardContent = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Header with Level and XP */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Award size={24} color="white" />
          <AppText style={styles.title}>Your Progress</AppText>
        </View>
        <TouchableOpacity 
          style={styles.levelBadge}
          onPress={() => setShowRoadmap(!showRoadmap)}
        >
          <AppText style={styles.levelText}>Level {userLevel}</AppText>
        </TouchableOpacity>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <AppText style={styles.xpText}>{progress?.totalXP || 0} XP</AppText>
          <AppText style={styles.nextLevelText}>
            {100 - levelProgress} XP to Level {userLevel + 1}
          </AppText>
        </View>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })
              }
            ]} 
          />
        </View>
      </View>

      {/* Stats Grid */}
      {showDetails && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <BookOpen size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{totalLessonsCompleted}</AppText>
            <AppText style={styles.statLabel}>Lessons</AppText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Zap size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{streak}</AppText>
            <AppText style={styles.statLabel}>Day Streak</AppText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Target size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{totalBadges}</AppText>
            <AppText style={styles.statLabel}>Badges</AppText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <TrendingUp size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{overallProgress}%</AppText>
            <AppText style={styles.statLabel}>Complete</AppText>
          </View>
        </View>
      )}

      {/* Rotating Learning Tip */}
      <Animated.View style={[styles.tipContainer, { opacity: tipFadeAnim }]}>
        <View style={styles.tipContent}>
          <AppText style={styles.tipEmoji}>{LEARNING_TIPS[currentTipIndex].emoji}</AppText>
          <AppText style={styles.tipText}>{LEARNING_TIPS[currentTipIndex].tip}</AppText>
        </View>
      </Animated.View>

      {/* Roadmap Section - Toggle with level badge click */}
      {showRoadmap && (
        <View style={styles.roadmapSection}>
          <View style={styles.roadmapHeader}>
            <Compass size={18} color="white" />
            <AppText style={styles.roadmapTitle}>Your Learning Journey</AppText>
          </View>
          
          <View style={styles.roadmapModules}>
            {courses.slice(0, 3).map((course) => {
              const courseProgress = completedLessons[course.id]?.length || 0;
              const totalLessons = course.lessonsCount || 10;
              const isCompleted = courseProgress >= totalLessons;
              const isInProgress = courseProgress > 0 && !isCompleted;
              
              return (
                <View key={course.id} style={styles.moduleItem}>
                  <View style={[
                    styles.moduleDot,
                    isCompleted && styles.moduleDotCompleted,
                    isInProgress && styles.moduleDotInProgress,
                  ]} />
                  <AppText style={styles.moduleText} numberOfLines={1}>
                    {course.emoji || '📚'} {course.title}
                  </AppText>
                  {isCompleted && <AppText style={styles.moduleBadge}>✓</AppText>}
                </View>
              );
            })}
            {courses.length > 3 && (
              <AppText style={styles.moreModules}>+{courses.length - 3} more modules</AppText>
            )}
          </View>
        </View>
      )}

      {/* Call to Action - Roadmap Link */}
      <TouchableOpacity 
        style={styles.roadmapLink}
        onPress={() => {
          // Navigate to roadmap or expand roadmap section
          setShowRoadmap(!showRoadmap);
        }}
      >
        <View style={styles.roadmapLinkContent}>
          <Sparkles size={16} color="white" />
          <AppText style={styles.roadmapLinkText}>
            {showRoadmap 
              ? "✨ Hide roadmap" 
              : "🗺️ Start your learning journey - click for roadmap"}
          </AppText>
          <ArrowRight size={16} color="white" />
        </View>
      </TouchableOpacity>

      {/* Self-paced Message */}
      <AppText style={styles.selfPacedText}>
        Go at your own pace • Check out the modules below
      </AppText>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: rotate },
              ],
            },
          ]}
        >
          <CardContent />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { scale: scaleAnim },
            { rotate: rotate },
          ],
        },
      ]}
    >
      <CardContent />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    padding: 20,
  },
  touchable: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  xpSection: {
    marginBottom: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextLevelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  tipContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    color: 'white',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  roadmapSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  roadmapTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  roadmapModules: {
    gap: 8,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  moduleDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  moduleDotInProgress: {
    backgroundColor: '#FFC107',
  },
  moduleText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
    opacity: 0.9,
  },
  moduleBadge: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  moreModules: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 16,
  },
  roadmapLink: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    marginBottom: 8,
  },
  roadmapLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  roadmapLinkText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  selfPacedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    width: width - 40,
    alignSelf: 'center',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
});