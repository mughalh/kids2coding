import { useState, useEffect, useRef } from "react";
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

export default function FixTheBugGame({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();
  
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [code, setCode] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [hint, setHint] = useState("");
  const [output, setOutput] = useState("");
  const [showRules, setShowRules] = useState(true);
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
      
      // Check for saved progress
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
      Alert.alert("Error", "Failed to load game levels");
    } finally {
      setLoading(false);
    }
  };

  const loadLevel = (level) => {
    setCurrentLevel(level);
    setCode(level.buggyCode);
    setExpectedOutput(level.expectedOutput);
    setHint(level.hint);
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
      Alert.alert("🏆 Congratulations!", "You've fixed all bugs!");
    }
  };

  const runBugFix = () => {
    if (!code) {
      Alert.alert("⚠️ Error", "No code to run!");
      return;
    }

    let outputStr = "";
    const originalLog = console.log;

    try {
      console.log = (...args) => {
        outputStr += args.join(" ") + "\n";
      };

      eval(code);
      
      const trimmedOutput = outputStr.trim();
      const trimmedExpected = expectedOutput.trim();

      if (trimmedOutput === trimmedExpected) {
        const newScore = score + (currentLevel.xpReward || 10);
        setScore(newScore);
        setOutput(trimmedOutput);
        
        Alert.alert("🎉 Success!", "Correct output! +" + (currentLevel.xpReward || 10) + " XP");
        
        setTimeout(() => {
          loadNextLevel();
        }, 1500);
      } else {
        Alert.alert("😅 Incorrect", `Expected:\n${trimmedExpected}\n\nGot:\n${trimmedOutput || "nothing"}`);
        setOutput(trimmedOutput || "No output");
      }
    } catch (err) {
      Alert.alert("🐞 Error", `Fix the bug: ${err.message}`);
      setOutput(`Error: ${err.message}`);
    } finally {
      console.log = originalLog;
    }
  };

  const showHintPopup = () => {
    Alert.alert("💡 Hint", hint || "No hint available for this level.");
  };

  const resetLevel = () => {
    if (currentLevel) {
      setCode(currentLevel.buggyCode);
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
        <AppText style={styles.loadingText}>Loading levels...</AppText>
      </View>
    );
  }

  if (gameCompleted) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={[styles.completeTitle, { color: gameWon ? Colors.success : Colors.error }]}>
          {gameWon ? "🎉 All Bugs Fixed! 🎉" : "💔 Game Over"}
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
            <AppText style={styles.modalTitle}>Mission: Fix the Bug 🐞</AppText>
            <View style={styles.rulesList}>
              <AppText style={styles.ruleItem}>1. A bug exists in the code.</AppText>
              <AppText style={styles.ruleItem}>2. Fix it to match the output.</AppText>
              <AppText style={styles.ruleItem}>3. Tap "Run Code" to test.</AppText>
              <AppText style={styles.ruleItem}>4. Stuck? Tap Hint.</AppText>
              <AppText style={styles.ruleItem}>5. Complete all levels to win!</AppText>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowRules(false)}>
              <AppText style={styles.buttonText}>Start Debugging 🛠️</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <AppText style={styles.title}>Fix the Bug 🐞</AppText>
        <View style={styles.statsContainer}>
          <AppText style={styles.levelProgress}>
            Level {currentLevelIndex + 1}/{totalLevels}
          </AppText>
          <AppText style={styles.scoreText}>Score: {score}</AppText>
        </View>
      </View>

      <View style={styles.editorContainer}>
        <TextInput
          style={styles.codeBox}
          multiline
          value={code}
          onChangeText={setCode}
          textAlignVertical="top"
          placeholder="Write your code here..."
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity style={[styles.button, styles.runButton]} onPress={runBugFix}>
        <AppText style={styles.buttonText}>Run Code ▶️</AppText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.hintButton]} onPress={showHintPopup}>
        <AppText style={styles.buttonText}>Show Hint 💡</AppText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetLevel}>
        <AppText style={styles.buttonText}>Reset Level 🔄</AppText>
      </TouchableOpacity>

      <View style={styles.expectedContainer}>
        <AppText style={styles.outputTitle}>Expected Output</AppText>
        <View style={styles.expectedBox}>
          <AppText selectable style={styles.expectedText}>
            {expectedOutput || "No expected output set"}
          </AppText>
        </View>
      </View>

      <AppText style={styles.outputTitle}>Your Output</AppText>
      <View style={styles.outputBox}>
        <AppText selectable style={output.includes("Error") ? styles.errorText : null}>
          {output || "Run code to see output"}
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, color: Colors.textLight },
  completeTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  completeSubtitle: { fontSize: 18, marginBottom: 20, color: Colors.text },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  statsContainer: { flexDirection: "row", gap: 15 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text },
  levelProgress: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  scoreText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  editorContainer: { backgroundColor: "#1e1e1e", borderRadius: 12, borderWidth: 1, borderColor: "#333", marginBottom: 10 },
  codeBox: { color: "#d4d4d4", padding: 15, minHeight: 200, fontFamily: "monospace", fontSize: 14, lineHeight: 20 },
  button: { padding: 15, borderRadius: 12, marginTop: 10, alignItems: "center" },
  runButton: { backgroundColor: "#4CAF50" },
  hintButton: { backgroundColor: "#FF9800" },
  resetButton: { backgroundColor: "#9E9E9E" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  expectedContainer: { marginTop: 20 },
  outputTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: Colors.text },
  expectedBox: { backgroundColor: "#e8f5e8", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#4CAF50", marginBottom: 15 },
  expectedText: { color: "#2e7d32", fontFamily: "monospace" },
  outputBox: { backgroundColor: "#f5f5f5", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", minHeight: 80 },
  errorText: { color: "#d32f2f" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "white", borderRadius: 20, padding: 25, width: "100%", elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#E91E63" },
  rulesList: { marginBottom: 25 },
  ruleItem: { fontSize: 16, marginBottom: 12, color: "#333", lineHeight: 22 },
  modalButton: { backgroundColor: "#E91E63", padding: 16, borderRadius: 12, alignItems: "center" },
});