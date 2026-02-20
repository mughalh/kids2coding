import { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";
import { getGameLevels } from "../services/gamesService";
import { useProgress } from "../hooks/useProgress";

export default function SyntaxPuzzle({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();
  
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    loadLevels();
  }, [gameId]);

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
    setCode(level.codeWithBugs);
    setOutput("");
  };

  const loadNextLevel = () => {
    const nextIndex = currentLevelIndex + 1;
    
    if (nextIndex < totalLevels) {
      setCurrentLevelIndex(nextIndex);
      loadLevel(levels[nextIndex]);
      saveGameProgress(gameId, nextIndex, score, false);
    } else {
      setGameWon(true);
      setGameCompleted(true);
      onGameComplete?.(true, score);
      saveGameProgress(gameId, nextIndex, score, true);
    }
  };

  const runPuzzle = () => {
    let outputStr = "";
    const originalLog = console.log;

    try {
      console.log = (...args) => {
        outputStr += args.join(" ") + "\n";
      };

      eval(code);

      if (outputStr.trim() === currentLevel.expectedOutput) {
        const newScore = score + (currentLevel.xpReward || 15);
        setScore(newScore);
        Alert.alert("🎉 Success!", "Syntax fixed! +" + (currentLevel.xpReward || 15) + " XP");
        
        setTimeout(() => {
          loadNextLevel();
        }, 1500);
      } else {
        Alert.alert("⚠️ Almost!", "Output is not correct.");
      }

      setOutput(outputStr.trim());
    } catch (err) {
      Alert.alert("🐞 Syntax Error!", "Fix the code and try again.");
      setOutput("");
    } finally {
      console.log = originalLog;
    }
  };

  const showHint = () => {
    Alert.alert("💡 Hint", currentLevel?.hint || "No hint available");
  };

  const resetCode = () => {
    if (currentLevel) {
      setCode(currentLevel.codeWithBugs);
      setOutput("");
    }
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Loading puzzles...</AppText>
      </View>
    );
  }

  if (gameCompleted) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={[styles.completeTitle, { color: gameWon ? Colors.success : Colors.error }]}>
          {gameWon ? "🎉 Puzzle Master! 🎉" : "💔 Game Over"}
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
      <Modal visible={showInstructions} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Mission: Syntax Fix 🧩</AppText>
            <View style={styles.rulesList}>
              <AppText style={styles.ruleItem}>1. Fix the syntax errors in the code.</AppText>
              <AppText style={styles.ruleItem}>2. Make it output the expected result.</AppText>
              <AppText style={styles.ruleItem}>3. Tap "Run Code" to test.</AppText>
              <AppText style={styles.ruleItem}>4. Complete all levels to win!</AppText>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowInstructions(false)}>
              <AppText style={styles.buttonText}>Enter Puzzle 🚀</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <AppText style={styles.title}>Syntax Puzzle</AppText>
        <View style={styles.statsRow}>
          <AppText style={styles.levelText}>Level {currentLevelIndex + 1}/{totalLevels}</AppText>
          <AppText style={styles.scoreText}>Score: {score}</AppText>
        </View>
      </View>

      <AppText style={styles.subtitle}>
        Fix the code to print numbers from 1 to 5
      </AppText>

      <View style={styles.editorContainer}>
        <TextInput
          style={styles.codeBox}
          multiline
          value={code}
          onChangeText={setCode}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={runPuzzle}>
        <AppText style={styles.buttonText}>Run Code ▶️</AppText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#ff9800" }]} onPress={showHint}>
        <AppText style={styles.buttonText}>Show Hint 💡</AppText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#777" }]} onPress={resetCode}>
        <AppText style={styles.buttonText}>Reset Code 🔄</AppText>
      </TouchableOpacity>

      <AppText style={styles.outputTitle}>Output</AppText>
      <View style={styles.outputBox}>
        <AppText selectable>{output}</AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, color: Colors.textLight },
  header: { marginBottom: 15 },
  title: { fontSize: 26, fontWeight: "bold", color: Colors.text },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  levelText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  scoreText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  completeTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  completeSubtitle: { fontSize: 18, marginBottom: 20, color: Colors.text },
  editorContainer: { backgroundColor: "#1e1e1e", borderRadius: 12, marginBottom: 10 },
  codeBox: { color: "#d4d4d4", padding: 15, minHeight: 200, fontFamily: "monospace", fontSize: 14, lineHeight: 20 },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, marginTop: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  outputTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, color: Colors.text },
  outputBox: { backgroundColor: "#f2f2f2", padding: 15, borderRadius: 12, marginTop: 10, minHeight: 80 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "white", borderRadius: 20, padding: 25, width: "100%", elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: Colors.primary },
  rulesList: { marginBottom: 20 },
  ruleItem: { fontSize: 15, marginBottom: 10, lineHeight: 22, color: "#333" },
  modalButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, alignItems: "center" },
});