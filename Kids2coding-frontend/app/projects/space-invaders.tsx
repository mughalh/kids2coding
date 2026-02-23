import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { Heart, Eye, Star, Github, ExternalLink, Play } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function SpaceInvadersProject() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [enemies, setEnemies] = useState([
    { id: 1, x: 50, y: 50, active: true },
    { id: 2, x: 150, y: 50, active: true },
    { id: 3, x: 250, y: 50, active: true },
    { id: 4, x: 350, y: 50, active: true },
    { id: 5, x: 450, y: 50, active: true },
  ]);
  const [playerX, setPlayerX] = useState(width / 2 - 25);
  const [bullets, setBullets] = useState<{ x: number; y: number }[]>([]);
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const enemyDirection = useRef(1);
  const enemySpeed = useRef(2);

  useEffect(() => {
    if (isPlaying) {
      startGame();
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setEnemies([
      { id: 1, x: 50, y: 50, active: true },
      { id: 2, x: 150, y: 50, active: true },
      { id: 3, x: 250, y: 50, active: true },
      { id: 4, x: 350, y: 50, active: true },
      { id: 5, x: 450, y: 50, active: true },
    ]);
    setBullets([]);
    
    gameLoopRef.current = setInterval(() => {
      updateGame();
    }, 50);
  };

  const updateGame = () => {
    // Move enemies
    setEnemies(prev => {
      let shouldMoveDown = false;
      const newEnemies = prev.map(enemy => {
        if (!enemy.active) return enemy;
        
        let newX = enemy.x + enemySpeed.current * enemyDirection.current;
        
        // Check boundaries
        if (newX > width - 100 || newX < 50) {
          shouldMoveDown = true;
        }
        
        return { ...enemy, x: newX };
      });

      if (shouldMoveDown) {
        enemyDirection.current *= -1;
        return newEnemies.map(enemy => ({
          ...enemy,
          y: enemy.y + 20,
        }));
      }
      return newEnemies;
    });

    // Move bullets
    setBullets(prev => {
      const newBullets = prev
        .map(bullet => ({ ...bullet, y: bullet.y - 10 }))
        .filter(bullet => bullet.y > 0);
      
      // Check collisions
      newBullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
          if (
            enemy.active &&
            Math.abs(bullet.x - enemy.x) < 30 &&
            Math.abs(bullet.y - enemy.y) < 30
          ) {
            setEnemies(prev => {
              const newEnemies = [...prev];
              newEnemies[enemyIndex].active = false;
              return newEnemies;
            });
            setScore(prev => prev + 10);
            newBullets.splice(bulletIndex, 1);
          }
        });
      });

      return newBullets;
    });

    // Check win/lose conditions
    const activeEnemies = enemies.filter(e => e.active);
    if (activeEnemies.length === 0) {
      Alert.alert("🎉 Victory!", "You destroyed all enemies!", [
        { text: "Play Again", onPress: startGame },
        { text: "Exit", onPress: () => setIsPlaying(false) },
      ]);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }

    activeEnemies.forEach(enemy => {
      if (enemy.y > height - 200) {
        setLives(prev => {
          if (prev <= 1) {
            Alert.alert("💀 Game Over", "The enemies reached Earth!", [
              { text: "Try Again", onPress: startGame },
              { text: "Exit", onPress: () => setIsPlaying(false) },
            ]);
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return 0;
          }
          return prev - 1;
        });
      }
    });
  };

  const shoot = () => {
    setBullets(prev => [...prev, { x: playerX + 20, y: 550 }]);
  };

  const moveLeft = () => {
    setPlayerX(prev => Math.max(0, prev - 20));
  };

  const moveRight = () => {
    setPlayerX(prev => Math.min(width - 70, prev + 20));
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>← Back to Projects</AppText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.titleSection}>
            <AppText style={styles.emoji}>👾</AppText>
            <View>
              <AppText style={styles.title}>Space Invaders</AppText>
              <AppText style={styles.author}>by Alex Johnson</AppText>
            </View>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Heart size={16} color={Colors.accent} />
              <AppText style={styles.statText}>234</AppText>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color={Colors.textLight} />
              <AppText style={styles.statText}>1.2k</AppText>
            </View>
            <View style={styles.statItem}>
              <Star size={16} color={Colors.warning} />
              <AppText style={styles.statText}>89</AppText>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {/* Open demo */}}>
            <ExternalLink size={16} color="white" />
            <AppText style={styles.actionText}>Live Demo</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.githubButton]} onPress={() => {/* Open GitHub */}}>
            <Github size={16} color="white" />
            <AppText style={styles.actionText}>GitHub</AppText>
          </TouchableOpacity>
        </View>

        {!isPlaying ? (
          <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(true)}>
            <Play size={24} color="white" />
            <AppText style={styles.playText}>Play Game</AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.gameContainer}>
            <View style={styles.gameStats}>
              <AppText style={styles.gameStat}>Score: {score}</AppText>
              <AppText style={styles.gameStat}>Lives: {"❤️".repeat(lives)}</AppText>
            </View>

            <View style={styles.gameArea}>
              {/* Enemies */}
              {enemies.map(enemy => enemy.active && (
                <View
                  key={enemy.id}
                  style={[styles.enemy, { left: enemy.x, top: enemy.y }]}
                >
                  <AppText style={styles.enemyText}>👾</AppText>
                </View>
              ))}

              {/* Bullets */}
              {bullets.map((bullet, index) => (
                <View
                  key={index}
                  style={[styles.bullet, { left: bullet.x, top: bullet.y }]}
                />
              ))}

              {/* Player */}
              <View style={[styles.player, { left: playerX }]}>
                <AppText style={styles.playerText}>🚀</AppText>
              </View>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
                <AppText style={styles.controlText}>←</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={shoot}>
                <AppText style={styles.controlText}>🔫</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
                <AppText style={styles.controlText}>→</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>About this project</AppText>
          <AppText style={styles.description}>
            A classic retro arcade game built with JavaScript and HTML5 Canvas. 
            Defend Earth from invading aliens in this space shooter inspired by 
            the original 1978 arcade game.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Technologies Used</AppText>
          <View style={styles.techTags}>
            {["JavaScript", "HTML5 Canvas", "CSS3", "Game Loop"].map((tech, index) => (
              <View key={index} style={styles.techTag}>
                <AppText style={styles.techText}>{tech}</AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Features</AppText>
          <View style={styles.featuresList}>
            {[
              "Multiple enemy waves",
              "Score tracking",
              "Lives system",
              "Increasing difficulty",
              "Sound effects",
              "High score persistence",
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <AppText style={styles.featureBullet}>•</AppText>
                <AppText style={styles.featureText}>{feature}</AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  author: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stats: {
    flexDirection: "row",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  githubButton: {
    backgroundColor: "#333",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  playButton: {
    backgroundColor: Colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  playText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  gameContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gameStat: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  gameArea: {
    height: 400,
    backgroundColor: "#0a0a0a",
    borderRadius: 15,
    position: "relative",
    marginBottom: 20,
  },
  enemy: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  enemyText: {
    fontSize: 24,
  },
  bullet: {
    position: "absolute",
    width: 4,
    height: 10,
    backgroundColor: "yellow",
    borderRadius: 2,
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  playerText: {
    fontSize: 24,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  controlText: {
    fontSize: 24,
    color: "white",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  techTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  techTag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  techText: {
    fontSize: 12,
    color: Colors.text,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureBullet: {
    fontSize: 16,
    color: Colors.primary,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});