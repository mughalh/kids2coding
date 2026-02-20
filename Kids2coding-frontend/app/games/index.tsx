import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { getAllGames } from "../../src/services/gamesService";
import { LinearGradient } from "expo-linear-gradient";
import { useProgress } from "../../src/hooks/useProgress";

export default function GamesScreen() {
  const router = useRouter();
  const { gamesWon, gamesLost } = useProgress();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const gamesData = await getAllGames();
    setGames(gamesData);
    setLoading(false);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <AppText style={styles.title}>Coding Games 🎮</AppText>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <AppText style={styles.statValue}>Won: {gamesWon}</AppText>
          </View>
          <View style={styles.statBadge}>
            <AppText style={styles.statValue}>Lost: {gamesLost}</AppText>
          </View>
        </View>
        <AppText style={styles.subtitle}>Learn while you play</AppText>
      </View>

      <ScrollView style={styles.container}>
        {games.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyEmoji}>🎮</AppText>
            <AppText style={styles.emptyTitle}>No games yet</AppText>
            <AppText style={styles.emptyText}>
              Check back soon for new games!
            </AppText>
          </View>
        ) : (
          games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => router.push(`/games/${game.id}`)}
            >
              <LinearGradient
                colors={[game.color || Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <View style={styles.gameHeader}>
                  <AppText style={styles.gameEmoji}>{game.emoji || '🎮'}</AppText>
                  <View style={styles.difficultyBadge}>
                    <AppText style={styles.difficultyText}>{game.difficulty || 'beginner'}</AppText>
                  </View>
                </View>
                <AppText style={styles.gameTitle}>{game.title}</AppText>
                <AppText style={styles.gameDescription}>{game.description}</AppText>
                <View style={styles.gameMeta}>
                  <AppText style={styles.gameLevels}>
                    {game.levels ? Object.keys(game.levels).length : 0} levels
                  </AppText>
                  <AppText style={styles.xpReward}>🏆 {game.xpReward || 50} XP</AppText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  statBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 5,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  gameCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameEmoji: {
    fontSize: 40,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    lineHeight: 20,
  },
  gameMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameLevels: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  xpReward: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});