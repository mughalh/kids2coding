import React, { useState, useEffect } from "react";
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

export default function LogicMaze({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();
  
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [path, setPath] = useState([]);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(0);
  const [puzzleActive, setPuzzleActive] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
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
    setMaze(JSON.parse(JSON.stringify(level.maze)));
    setPlayerPos(findStart(level.maze));
    setPath([findStart(level.maze)]);
    setMovesLeft(level.maxMoves);
    setPuzzleActive(false);
  };

  const findStart = (mazeData) => {
    for (let r = 0; r < mazeData.length; r++) {
      for (let c = 0; c < mazeData[0].length; c++) {
        if (mazeData[r][c] === "S") return { row: r, col: c };
      }
    }
    return { row: 0, col: 0 };
  };

  const movePlayer = (direction) => {
    if (puzzleActive || showInstructions || movesLeft <= 0) return;

    const { row, col } = playerPos;
    let newRow = row, newCol = col;

    if (direction === "up") newRow -= 1;
    if (direction === "down") newRow += 1;
    if (direction === "left") newCol -= 1;
    if (direction === "right") newCol += 1;

    if (newRow < 0 || newRow >= maze.length || newCol < 0 || newCol >= maze[0].length) return;

    const cell = maze[newRow][newCol];
    if (cell === 1) return;

    const newMaze = [...maze];
    const newMoves = movesLeft - 1;
    setMovesLeft(newMoves);

    let newScore = score;
    if (cell === "*") {
      newScore += 10;
      setScore(newScore);
      newMaze[newRow][newCol] = 0;
      setMaze(newMaze);
    }

    setPlayerPos({ row: newRow, col: newCol });
    setPath([...path, { row: newRow, col: newCol }]);

    saveGameProgress(gameId, currentLevelIndex, newScore, false);

    if (cell === "F") {
      const nextIndex = currentLevelIndex + 1;
      const newScoreTotal = newScore + (currentLevel.xpReward || 50);
      setScore(newScoreTotal);

      if (nextIndex < totalLevels) {
        Alert.alert("🎉 Level Complete!", `Moving to level ${nextIndex + 1}`);
        setCurrentLevelIndex(nextIndex);
        loadLevel(levels[nextIndex]);
        saveGameProgress(gameId, nextIndex, newScoreTotal, false);
      } else {
        setGameWon(true);
        setGameCompleted(true);
        onGameComplete?.(true, newScoreTotal);
        saveGameProgress(gameId, nextIndex, newScoreTotal, true);
        Alert.alert("🏆 Game Complete!", `You finished with ${newScoreTotal} points!`);
      }
    }

    if (cell === "P") {
      setPuzzleActive(true);
    }

    if (newMoves <= 0) {
      setGameWon(false);
      setGameCompleted(true);
      onGameComplete?.(false, newScore);
      saveGameProgress(gameId, currentLevelIndex, newScore, true);
      Alert.alert("❌ Out of moves!", "Game Over");
    }
  };

  const solvePuzzle = () => {
    Alert.alert("✅ Puzzle Solved!", "You unlocked a new path!");
    setPuzzleActive(false);

    const newMaze = [...maze];
    const { row, col } = playerPos;
    if (row + 1 < maze.length && newMaze[row + 1][col] === 1) {
      newMaze[row + 1][col] = 0;
      setMaze(newMaze);
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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (gameCompleted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <AppText style={[styles.completeTitle, { color: gameWon ? Colors.success : Colors.error }]}>
          {gameWon ? "🏆 Maze Master! 🎉" : "💔 Game Over"}
        </AppText>
        <AppText style={styles.completeSubtitle}>
          You scored {score} points!
        </AppText>
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showInstructions} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.instructionsBox}>
            <Text style={styles.modalTitle}>How to Play 🎮</Text>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#6c5ce7" }]} />
              <Text style={styles.legendText}> S: Start</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#00b894" }]} />
              <Text style={styles.legendText}> F: Finish</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#2d3436" }]} />
              <Text style={styles.legendText}> Wall</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#fd79a8" }]} />
              <Text style={styles.legendText}> *: Collectible (+10 pts)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#ffeaa7" }]} />
              <Text style={styles.legendText}> P: Puzzle (Unlocks path)</Text>
            </View>
            <Text style={styles.instructionNote}>
              Goal: Reach 'F' before you run out of moves!
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={() => setShowInstructions(false)}>
              <Text style={styles.buttonText}>Start Game 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Logic Maze</Text>
        <View style={styles.statsRow}>
          <Text style={styles.levelText}>Level {currentLevelIndex + 1}/{totalLevels}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.movesText}>Moves: {movesLeft}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {maze.map((rowArr, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {rowArr.map((cell, colIndex) => {
              const isPlayer = playerPos.row === rowIndex && playerPos.col === colIndex;
              const isPath = path.some(p => p.row === rowIndex && p.col === colIndex);

              let bgColor = "#fff";
              if (cell === 1) bgColor = "#2d3436";
              if (cell === "S") bgColor = "#6c5ce7";
              if (cell === "F") bgColor = "#00b894";
              if (cell === "*") bgColor = "#fd79a8";
              if (cell === "P") bgColor = "#ffeaa7";
              if (isPlayer) bgColor = "#fdcb6e";
              if (isPath && !isPlayer) bgColor = "#dfe6e9";

              return (
                <View key={colIndex} style={[styles.cell, { backgroundColor: bgColor }]}>
                  <Text style={styles.cellText}>
                    {cell === 0 || cell === 1 ? "" : cell}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("up")}>
          <Text style={styles.buttonText}>↑</Text>
        </TouchableOpacity>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("left")}>
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("down")}>
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("right")}>
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={puzzleActive} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.instructionsBox}>
            <Text style={styles.modalText}>Solve the puzzle to unlock the path!</Text>
            <TouchableOpacity style={styles.solveButton} onPress={solvePuzzle}>
              <Text style={styles.buttonText}>Solve Puzzle ✅</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", alignItems: "center", paddingTop: 40 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { width: "100%", paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: Colors.text, marginBottom: 10, textAlign: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  levelText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  scoreText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  movesText: { fontSize: 16, color: Colors.error, fontWeight: "600" },
  grid: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" },
  cell: { width: 55, height: 55, borderWidth: 1, borderColor: "#b2bec3", justifyContent: "center", alignItems: "center" },
  cellText: { fontSize: 16, fontWeight: "bold" },
  controls: { marginTop: 30, alignItems: "center" },
  controlRow: { flexDirection: "row", justifyContent: "center" },
  controlButton: { margin: 5, backgroundColor: "#6c5ce7", padding: 12, borderRadius: 8, minWidth: 50, alignItems: "center" },
  restartButton: { marginTop: 15, backgroundColor: "#00b894", padding: 12, borderRadius: 8, minWidth: 100, alignItems: "center" },
  buttonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  completeTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  completeSubtitle: { fontSize: 18, marginBottom: 20, color: Colors.text },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  instructionsBox: { backgroundColor: "#fff", padding: 25, borderRadius: 20, width: "85%", alignItems: "center" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#6c5ce7" },
  legendRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginBottom: 10 },
  miniCell: { width: 20, height: 20, borderRadius: 4, marginRight: 10 },
  legendText: { fontSize: 16, color: "#2d3436" },
  instructionNote: { marginVertical: 20, fontSize: 16, fontWeight: "bold", textAlign: "center" },
  startButton: { backgroundColor: "#6c5ce7", padding: 15, borderRadius: 12, width: "100%", alignItems: "center" },
  modalText: { fontSize: 22, color: "#2d3436", marginBottom: 20, textAlign: "center" },
  solveButton: { backgroundColor: "#fdcb6e", padding: 15, borderRadius: 10 },
});