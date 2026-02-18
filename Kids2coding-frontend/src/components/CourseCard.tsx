import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    emoji: string;
    description: string;
    level: string;
    duration: string;
    color: string;
    bgColor: string;
    lessons: number;
    progress: number;
    tags: string[];
  };
  onPress: () => void;
  style?: ViewStyle;
  horizontal?: boolean;
}

const { width } = Dimensions.get('window');

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  style,
  horizontal = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
    
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: -1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  if (horizontal) {
    return (
      <Animated.View 
        style={[
          styles.horizontalCard, 
          { 
            transform: [
              { scale: scaleAnim },
              { rotate: rotate }
            ],
            backgroundColor: course.bgColor,
            borderColor: course.color,
          },
          style 
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.horizontalContent}>
            <View style={[styles.emojiContainer, { backgroundColor: course.color }]}>
              <AppText style={styles.emoji}>{course.emoji}</AppText>
            </View>
            <View style={styles.horizontalText}>
              <AppText style={styles.horizontalTitle}>{course.title}</AppText>
              <AppText style={styles.horizontalDescription} numberOfLines={2}>
                {course.description}
              </AppText>
              <View style={styles.horizontalMeta}>
                <View style={styles.metaItem}>
                  <AppText style={styles.metaText}>{course.lessons} lessons</AppText>
                </View>
                <View style={styles.metaItem}>
                  <AppText style={styles.metaText}>{course.duration}</AppText>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.card, 
        { 
          transform: [
            { scale: scaleAnim },
            { rotate: rotate }
          ],
          borderColor: course.color,
        },
        style 
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={[course.bgColor, 'white']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.emojiContainer, { backgroundColor: course.color }]}>
              <AppText style={styles.emoji}>{course.emoji}</AppText>
            </View>
            {course.progress > 0 && (
              <View style={styles.progressBadge}>
                <AppText style={styles.progressText}>{course.progress}%</AppText>
              </View>
            )}
          </View>
          
          <AppText style={styles.title}>{course.title}</AppText>
          <AppText style={styles.description} numberOfLines={2}>
            {course.description}
          </AppText>
          
          <View style={styles.tags}>
            {course.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <AppText style={styles.tagText}>{tag}</AppText>
              </View>
            ))}
          </View>
          
          <View style={styles.footer}>
            <View style={styles.meta}>
              <AppText style={styles.level}>{course.level}</AppText>
              <AppText style={styles.duration}>⏱️ {course.duration}</AppText>
            </View>
            
            {course.progress > 0 ? (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${course.progress}%`,
                      backgroundColor: course.color,
                    }
                  ]} 
                />
              </View>
            ) : (
              <View style={styles.startBadge}>
                <AppText style={styles.startText}>START</AppText>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  progressBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 15,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  footer: {
    marginTop: 'auto',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  level: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: Colors.textLight,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  startBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'flex-end',
  },
  startText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  horizontalCard: {
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  horizontalContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  horizontalText: {
    flex: 1,
    marginLeft: 15,
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  horizontalDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 16,
  },
  horizontalMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    marginRight: 15,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textLight,
  },
});