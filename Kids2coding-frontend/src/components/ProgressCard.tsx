import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, TrendingUp, Target, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ProgressCardProps {
  onPress?: () => void;
  showDetails?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  onPress,
  showDetails = true,
}) => {
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Stats data
  const stats = {
    totalXP: 1250,
    level: 5,
    progress: 65, // 65% to next level
    streak: 7,
    badges: 12,
    completedLessons: 24,
  };

  // Calculate XP for next level
  const xpForNextLevel = 2000;
  const xpNeeded = xpForNextLevel - stats.totalXP;

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: stats.progress,
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
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '0deg'],
  });

  const CardContent = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Award size={24} color="white" />
          <AppText style={styles.title}>Your Progress</AppText>
        </View>
        <TouchableOpacity style={styles.levelBadge}>
          <AppText style={styles.levelText}>Level {stats.level}</AppText>
        </TouchableOpacity>
      </View>

      {/* XP Bar */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <AppText style={styles.xpText}>{stats.totalXP} XP</AppText>
          <AppText style={styles.nextLevelText}>
            {xpNeeded} XP to Level {stats.level + 1}
          </AppText>
        </View>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })}
            ]} 
          />
        </View>
      </View>

      {/* Stats Grid */}
      {showDetails && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Zap size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{stats.streak}</AppText>
            <AppText style={styles.statLabel}>Day Streak</AppText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Target size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{stats.badges}</AppText>
            <AppText style={styles.statLabel}>Badges</AppText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <TrendingUp size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>{stats.completedLessons}</AppText>
            <AppText style={styles.statLabel}>Lessons</AppText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Award size={16} color="white" />
            </View>
            <AppText style={styles.statValue}>85%</AppText>
            <AppText style={styles.statLabel}>Accuracy</AppText>
          </View>
        </View>
      )}

      {/* Achievements */}
      <View style={styles.achievements}>
        <AppText style={styles.achievementsTitle}>Recent Achievements</AppText>
        <View style={styles.achievementsList}>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <AppText style={styles.achievementEmoji}>🚀</AppText>
            </View>
            <View style={styles.achievementInfo}>
              <AppText style={styles.achievementName}>Quick Learner</AppText>
              <AppText style={styles.achievementDesc}>Complete 5 lessons in a day</AppText>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <AppText style={styles.achievementEmoji}>💪</AppText>
            </View>
            <View style={styles.achievementInfo}>
              <AppText style={styles.achievementName}>7-Day Streak</AppText>
              <AppText style={styles.achievementDesc}>Code for 7 days straight</AppText>
            </View>
          </View>
        </View>
      </View>
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
  touchable: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  gradient: {
    padding: 20,
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
    gap: 10,
  },
  title: {
    fontSize: 20,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpSection: {
    marginBottom: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  nextLevelText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: (width - 80) / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  achievements: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 20,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});