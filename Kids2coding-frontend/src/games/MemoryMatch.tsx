import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";
import { getGameLevels } from "../services/gamesService";
import { useProgress } from "../hooks/useProgress";
import MemoryMatchCard from "../components/MemoryMatchCard";

export default function MemoryMatchGame({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();
  
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [tries, setTries] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    loadLevels();
  }, [gameId]);

  useEffect(() => {
    if (showInstructions || gameCompleted) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [showInstructions, gameCompleted]);

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected;
      setTries((prev) => prev + 1);
      
      if (cards[first].value === cards[second].value) {
        const newCards = [...cards];
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setSelected([]);

        // Check if level complete
        if (newCards.every((card) => card.matched)) {
          const newScore = score + (currentLevel.xpReward || 50);
          setScore(newScore);
          
          const nextIndex = currentLevelIndex + 1;
          if (nextIndex < totalLevels) {
            Alert.alert("🎉 Level Complete!", `Moving to level ${nextIndex + 1}`);
            setCurrentLevelIndex(nextIndex);
            loadLevel(levels[nextIndex]);
            saveGameProgress(gameId, nextIndex, newScore, false);
          } else {
            setGameWon(true);
            setGameCompleted(true);
            onGameComplete?.(true, newScore);
            saveGameProgress(gameId, nextIndex, newScore, true);
          }
        }
      } else {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setSelected([]);
        }, 1000);
      }
    }
  }, [selected]);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const levelsData = await getGameLevels(gameId);
      setLevels(levelsData);
      setTotalLevels(levelsData.length);
      
      const savedProgress = getGameProgress(gameId);
      if (savedProgress && !savedProgress.completed) {
        const savedLevel = savedProgress.currentLevel || 0;
        setCurrentLevelIndex(savedLevel);
        setScore(savedProgress.score || 0);
        if (levelsData[savedLevel]) {
          loadLevel(levelsData[savedLevel]);
        }
      } else if (levelsData.length > 0) {
        loadLevel(levelsData[0]);
      }
    } catch (error) {
      console.error("Error loading levels:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLevel = (level) => {
    setCurrentLevel(level);
    const shuffledCards = [...level.items, ...level.items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        value: item,
        flipped: false,
        matched: false,
      }));
    setCards(shuffledCards);
    setSelected([]);
    setTries(0);
    setSeconds(0);
  };

  const handleCardPress = (index) => {
    if (cards[index].flipped || cards[index].matched || selected.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    setSelected([...selected, index]);
  };

  const restartGame = () => {
    setGameCompleted(false);
    setCurrentLevelIndex(0);
    setScore(0);
    setGameWon(false);
    if (levels.length > 0) {
      loadLevel(levels[0]);
    }
    saveGameProgress(gameId, 0, 0, false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (gameCompleted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={[styles.completeTitle, { color: gameWon ? Colors.success : Colors.error }]}>
          {gameWon ? "🎉 Memory Master! 🎉" : "💔 Game Over"}
        </Text>
        <Text style={styles.completeSubtitle}>
          You scored {score} points in {tries} tries and {seconds} seconds!
        </Text>
        <TouchableOpacity style={styles.button} onPress={restartGame}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showInstructions} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Memory Match Rules 🧠</Text>
            <View style={styles.rulesList}>
              <Text style={styles.ruleText}>1. Tap cards to reveal icons.</Text>
              <Text style={styles.ruleText}>2. Find matching pairs.</Text>
              <Text style={styles.ruleText}>3. Match all pairs to complete the level.</Text>
              <Text style={styles.ruleText}>4. Complete all levels to win!</Text>
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={() => setShowInstructions(false)}>
              <Text style={styles.buttonText}>Start Game 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Memory Match</Text>
        <View style={styles.statsRow}>
          <Text style={styles.levelText}>Level {currentLevelIndex + 1}/{totalLevels}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        <Text style={styles.info}>Tries: {tries} | Time: {seconds}s</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <MemoryMatchCard
            key={card.id}
            card={card}
            onPress={() => handleCardPress(index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={restartGame}>
        <Text style={styles.buttonText}>Restart Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", alignItems: "center", paddingTop: 40 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { alignItems: "center", width: "100%", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  statsRow: { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 5 },
  levelText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  scoreText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  info: { fontSize: 16, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", width: "90%", justifyContent: "center" },
  button: { marginTop: 20, backgroundColor: "#6c5ce7", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  completeTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  completeSubtitle: { fontSize: 16, marginBottom: 20, textAlign: "center", color: Colors.text },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", width: "85%", padding: 25, borderRadius: 20, alignItems: "center" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#6c5ce7" },
  rulesList: { width: "100%", marginBottom: 20 },
  ruleText: { fontSize: 16, color: "#2d3436", marginBottom: 10, lineHeight: 22 },
  startBtn: { backgroundColor: "#a29bfe", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
});