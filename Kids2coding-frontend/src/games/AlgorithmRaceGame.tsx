import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";
import { getGameLevels } from "../services/gamesService";
import { useProgress } from "../hooks/useProgress";

export default function AlgorithmRaceGame({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();
  
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showRules, setShowRules] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const levelsFetched = useRef(false);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || gameCompleted || showRules) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, gameCompleted, showRules]);

  // Load levels on mount
  useEffect(() => {
    loadLevels();
  }, [gameId]);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const levelsData = await getGameLevels(gameId);
      setLevels(levelsData);
      setTotalLevels(levelsData.length);
      
      // Check for saved progress
      const savedProgress = getGameProgress(gameId);
      if (savedProgress && !savedProgress.completed) {
        const savedLevel = savedProgress.currentLevel || 0;
        setCurrentLevelIndex(savedLevel);
        setScore(savedProgress.score || 0);
        if (levelsData[savedLevel]) {
          setCurrentLevel(levelsData[savedLevel]);
          setTimeLeft(levelsData[savedLevel].timeLimit);
        }
      } else if (levelsData.length > 0) {
        setCurrentLevel(levelsData[0]);
        setTimeLeft(levelsData[0].timeLimit);
      }
    } catch (error) {
      console.error("Error loading levels:", error);
      Alert.alert("Error", "Failed to load game levels");
    } finally {
      setLoading(false);
      levelsFetched.current = true;
    }
  };

  const handleTimeOut = () => {
    setGameWon(false);
    setGameCompleted(true);
    onGameComplete?.(false, score);
    saveGameProgress(gameId, currentLevelIndex, score, true);
    Alert.alert("⏰ Time's Up!", "Better luck next time!");
  };

  const submitSolution = () => {
    if (!currentLevel) return;
    
    const isCorrect = inputValue.trim() === currentLevel.correctSolution;
    const pointsEarned = isCorrect ? currentLevel.xpReward || 100 : 0;
    const newScore = score + pointsEarned;
    setScore(newScore);

    setFeedback({
      isCorrect,
      solution: currentLevel.correctSolution,
      explanation: currentLevel.explanation,
      points: pointsEarned,
    });

    if (isCorrect) {
      // Save progress
      saveGameProgress(gameId, currentLevelIndex, newScore, false);
      
      // Move to next level after delay
      setTimeout(() => {
        const nextIndex = currentLevelIndex + 1;
        if (nextIndex < totalLevels) {
          setCurrentLevelIndex(nextIndex);
          setCurrentLevel(levels[nextIndex]);
          setTimeLeft(levels[nextIndex].timeLimit);
          setInputValue("");
          setFeedback(null);
        } else {
          // Game complete - won
          setGameWon(true);
          setGameCompleted(true);
          onGameComplete?.(true, newScore);
          saveGameProgress(gameId, nextIndex, newScore, true);
        }
      }, 1500);
    }
  };

  const restartGame = () => {
    setGameCompleted(false);
    setCurrentLevelIndex(0);
    setScore(0);
    setGameWon(false);
    if (levels.length > 0) {
      setCurrentLevel(levels[0]);
      setTimeLeft(levels[0].timeLimit);
    }
    setInputValue("");
    setFeedback(null);
    saveGameProgress(gameId, 0, 0, false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Loading challenge...</AppText>
      </View>
    );
  }

  if (gameCompleted) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={[styles.completeTitle, { color: gameWon ? Colors.success : Colors.error }]}>
          {gameWon ? "🏁 Race Complete! 🎉" : "⏰ Time's Up! 💔"}
        </AppText>
        <AppText style={styles.completeSubtitle}>
          You scored {score} points!
        </AppText>
        <TouchableOpacity style={styles.button} onPress={restartGame}>
          <AppText style={styles.buttonText}>Play Again</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Modal visible={showRules} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Algorithm Race Rules</AppText>
            <View style={styles.rulesList}>
              <AppText style={styles.ruleItem}>1. Solve each algorithm challenge.</AppText>
              <AppText style={styles.ruleItem}>2. Type your answer exactly as required.</AppText>
              <AppText style={styles.ruleItem}>3. Beat the clock to earn points.</AppText>
              <AppText style={styles.ruleItem}>4. Complete all levels to win!</AppText>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowRules(false)}>
              <AppText style={styles.buttonText}>Start Racing</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <AppText style={styles.title}>Algorithm Race</AppText>
        <View style={styles.statsContainer}>
          <AppText style={styles.levelProgress}>
            Level {currentLevelIndex + 1}/{totalLevels}
          </AppText>
          <AppText style={styles.scoreText}>Score: {score}</AppText>
        </View>
      </View>

      {currentLevel && (
        <>
          <AppText style={styles.challengeTitle}>{currentLevel.title}</AppText>
          <AppText style={styles.statement}>{currentLevel.statement}</AppText>
          <AppText style={[styles.timer, timeLeft < 30 && styles.timerWarning]}>
            ⏱️ {timeLeft}s remaining
          </AppText>

          <TextInput
            style={styles.input}
            multiline
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter your solution..."
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={submitSolution}>
            <AppText style={styles.buttonText}>Submit Solution</AppText>
          </TouchableOpacity>

          {feedback && (
            <View style={styles.feedbackBox}>
              <AppText style={{ color: feedback.isCorrect ? Colors.success : Colors.error, fontWeight: 'bold' }}>
                {feedback.isCorrect ? "✅ Correct!" : "❌ Incorrect"}
              </AppText>
              <AppText style={styles.feedbackText}>Expected: {feedback.solution}</AppText>
              <AppText style={styles.feedbackText}>{feedback.explanation}</AppText>
              {feedback.isCorrect && (
                <AppText style={styles.pointsEarned}>+{feedback.points} points</AppText>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, color: Colors.textLight },
  completeTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  completeSubtitle: { fontSize: 18, marginBottom: 20, color: Colors.text },
  header: { marginBottom: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text },
  levelProgress: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  scoreText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  challengeTitle: { fontSize: 20, fontWeight: "600", color: Colors.text, marginBottom: 10 },
  statement: { fontSize: 16, color: Colors.text, marginBottom: 15, lineHeight: 22 },
  timer: { fontSize: 18, color: Colors.primary, fontWeight: "bold", marginBottom: 15 },
  timerWarning: { color: Colors.error },
  input: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
    textAlignVertical: "top",
  },
  submitBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, marginTop: 15, alignItems: "center" },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, marginTop: 20, minWidth: 200, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  feedbackBox: { backgroundColor: Colors.surface, padding: 15, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: Colors.border },
  feedbackText: { fontSize: 14, color: Colors.text, marginTop: 5 },
  pointsEarned: { fontSize: 16, color: Colors.success, fontWeight: "bold", marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "white", borderRadius: 20, padding: 25, width: "100%", maxWidth: 400 },
  modalTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: Colors.primary },
  rulesList: { marginBottom: 25 },
  ruleItem: { fontSize: 16, marginBottom: 12, color: Colors.text, lineHeight: 22 },
  modalButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, alignItems: "center" },
});