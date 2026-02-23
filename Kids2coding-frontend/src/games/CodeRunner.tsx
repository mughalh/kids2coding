import * as Clipboard from "expo-clipboard";
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

export default function CodeRunner({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();
  
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [code, setCode] = useState("");
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
    setCode(level.code);
    setOutput("");
  };

  const runCode = () => {
    let outputStr = "";
    const originalLog = console.log;
    try {
      console.log = (...args) => {
        outputStr += args.join(" ") + "\n";
      };
      eval(code);
      const trimmedOutput = outputStr.trim();
      const trimmedExpected = currentLevel.expectedOutput.trim();
      
      if (trimmedOutput === trimmedExpected) {
        const newScore = score + (currentLevel.xpReward || 10);
        setScore(newScore);
        Alert.alert("🎉 Success!", "Correct output! +" + (currentLevel.xpReward || 10) + " XP");
        setOutput(trimmedOutput);
        
        const nextIndex = currentLevelIndex + 1;
        if (nextIndex < totalLevels) {
          setCurrentLevelIndex(nextIndex);
          loadLevel(levels[nextIndex]);
          saveGameProgress(gameId, nextIndex, newScore, false);
        } else {
          setGameWon(true);
          setGameCompleted(true);
          onGameComplete?.(true, newScore);
          saveGameProgress(gameId, nextIndex, newScore, true);
        }
      } else {
        Alert.alert("❌ Incorrect", `Expected:\n${trimmedExpected}\nGot:\n${trimmedOutput}`);
        setOutput(trimmedOutput);
      }
    } catch (err) {
      Alert.alert("❌ Error", err.message);
      setOutput("");
    } finally {
      console.log = originalLog;
    }
  };

  const copyOutput = async () => {
    if (output) await Clipboard.setStringAsync(output);
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
        <AppText style={styles.loadingText}>Loading...</AppText>
      </View>
    );
  }

  if (gameCompleted) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={[styles.completeTitle, { color: gameWon ? Colors.success : Colors.error }]}>
          {gameWon ? "🎉 Code Master! 🎉" : "💔 Game Over"}
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
            <AppText style={styles.modalTitle}>How to Play</AppText>
            <View style={styles.rulesList}>
              <AppText style={styles.ruleItem}>1. Write JavaScript code.</AppText>
              <AppText style={styles.ruleItem}>2. Use console.log() to output.</AppText>
              <AppText style={styles.ruleItem}>3. Press Run Code.</AppText>
              <AppText style={styles.ruleItem}>4. Complete all levels to win!</AppText>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowRules(false)}>
              <AppText style={styles.buttonText}>Got it!</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <AppText style={styles.title}>Code Runner</AppText>
        <View style={styles.statsRow}>
          <AppText style={styles.levelText}>Level {currentLevelIndex + 1}/{totalLevels}</AppText>
          <AppText style={styles.scoreText}>Score: {score}</AppText>
        </View>
      </View>

      <View style={styles.editorContainer}>
        <TextInput
          style={styles.codeBox}
          multiline
          value={code}
          onChangeText={setCode}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={runCode}>
        <AppText style={styles.buttonText}>Run Code</AppText>
      </TouchableOpacity>

      <AppText style={styles.outputTitle}>Output</AppText>
      <View style={styles.outputBox}>
        <AppText selectable>{output}</AppText>
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={copyOutput}>
        <AppText style={styles.buttonText}>Copy Output</AppText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, color: Colors.textLight },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: Colors.text },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  levelText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  scoreText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  completeTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  completeSubtitle: { fontSize: 18, marginBottom: 20, color: Colors.text },
  editorContainer: { backgroundColor: "#1e1e1e", borderRadius: 12, marginBottom: 10 },
  codeBox: { color: "#d4d4d4", padding: 15, minHeight: 200, fontFamily: "monospace", fontSize: 14 },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, marginTop: 10, alignItems: "center" },
  copyButton: { backgroundColor: "#777", padding: 15, borderRadius: 12, marginTop: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  outputTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, color: Colors.text },
  outputBox: { backgroundColor: "#f2f2f2", padding: 15, borderRadius: 12, marginTop: 10, minHeight: 80 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "white", borderRadius: 20, padding: 25, width: "100%" },
  modalTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: Colors.primary },
  rulesList: { marginBottom: 25 },
  ruleItem: { fontSize: 16, marginBottom: 12, color: "#333", lineHeight: 22 },
  modalButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, alignItems: "center" },
});