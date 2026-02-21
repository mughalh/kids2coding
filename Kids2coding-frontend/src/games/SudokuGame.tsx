import { Feather, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
    ActivityIndicator
} from "react-native";
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";
import { useProgress } from "../hooks/useProgress";
import { getGameLevels } from "../services/gamesService";

export default function SudokuGame({ gameId, onGameComplete }) {
  const { width, height } = useWindowDimensions();
  const { saveGameProgress, getGameProgress } = useProgress();

  // Responsive Scaling Logic
  const isLargeScreen = width > 768;
  const boardSize = Math.min(width * 0.9, height * 0.55, 500);
  const cellSize = boardSize / 9;

  // -------- STATE --------
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");
  const [showLevelModal, setShowLevelModal] = useState(true);
  const [timer, setTimer] = useState(0);
  const [hints, setHints] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const timerRef = useRef(null);

  // Load levels from Firebase
  useEffect(() => {
    loadLevels();
  }, [gameId]);

  const loadLevels = async () => {
    try {
      const levelsData = await getGameLevels(gameId);
      setLevels(levelsData);
      
      // Check for saved progress
      const savedProgress = getGameProgress(gameId);
      if (savedProgress && !savedProgress.completed) {
        const savedLevel = savedProgress.currentLevel || 0;
        setCurrentLevelIndex(savedLevel);
        setScore(savedProgress.score || 0);
        if (levelsData[savedLevel]) {
          setDifficulty(levelsData[savedLevel].difficulty);
          generateSudoku(levelsData[savedLevel]);
        }
      }
    } catch (error) {
      console.error("Error loading levels:", error);
    } finally {
      setLoading(false);
    }
  };

  // -------- KEYBOARD SUPPORT (For Laptops/Web) --------
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleKeyDown = (e) => {
        if (!selectedCell) return;
        if (e.key >= "1" && e.key <= "9") onNumberInput(parseInt(e.key));
        if (e.key === "Backspace" || e.key === "0") onNumberInput(0);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedCell, grid]);

  // Timer effect
  useEffect(() => {
    if (showLevelModal || isGameOver || gameCompleted) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [showLevelModal, isGameOver, gameCompleted, currentLevelIndex]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // -------- GAME LOGIC --------
  const generateSudoku = (level) => {
    const seed = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];
    const solved = [...seed.map((row) => [...row])];
    setSolution(solved);

    const hideCount = level.hideCount || 30;
    const puzzle = solved.map((row) => [...row]);
    let hidden = 0;
    while (hidden < hideCount) {
      let r = Math.floor(Math.random() * 9);
      let c = Math.floor(Math.random() * 9);
      if (puzzle[r][c] !== 0) {
        puzzle[r][c] = 0;
        hidden++;
      }
    }
    setGrid(puzzle);
    setInitialGrid(puzzle.map((row) => [...row]));
    setTimer(0);
    setHints(level.hints || 3);
    setIsGameOver(false);
    setShowLevelModal(false);
  };

  const handleCellPress = (r, c) => {
    if (initialGrid[r][c] === 0) setSelectedCell({ r, c });
    else setSelectedCell({ r, c, isLocked: true });
  };

  const onNumberInput = (num) => {
    if (!selectedCell || isGameOver || selectedCell.isLocked) return;
    const { r, c } = selectedCell;
    const newGrid = [...grid.map((row) => [...row])];
    newGrid[r][c] = num;
    setGrid(newGrid);
    if (num !== 0) checkWin(newGrid);
  };

  const checkWin = (currentGrid) => {
    const isComplete = currentGrid.every((row, r) =>
      row.every((val, c) => val === solution[r][c])
    );
    if (isComplete) {
      clearInterval(timerRef.current);
      setIsGameOver(true);
      
      const newScore = score + (currentLevel?.xpReward || 50);
      setScore(newScore);
      
      Alert.alert(
        "🎉 Victory!",
        `Finished in ${formatTime(timer)}! +${currentLevel?.xpReward || 50} XP`,
        [
          {
            text: "Next Level",
            onPress: loadNextLevel
          }
        ]
      );
    }
  };

  const loadNextLevel = () => {
    const nextIndex = currentLevelIndex + 1;
    
    if (nextIndex < levels.length) {
      setCurrentLevelIndex(nextIndex);
      setDifficulty(levels[nextIndex].difficulty);
      generateSudoku(levels[nextIndex]);
      saveGameProgress(gameId, nextIndex, score, false);
    } else {
      // Game complete
      setGameCompleted(true);
      onGameComplete?.(true, score);
      saveGameProgress(gameId, nextIndex, score, true);
      Alert.alert(
        "🏆 Master Sudoku Solver!",
        `You completed all levels with ${score} points!`
      );
    }
  };

  const useHint = () => {
    if (hints > 0 && selectedCell && !selectedCell.isLocked) {
      const { r, c } = selectedCell;
      const newGrid = [...grid.map((row) => [...row])];
      newGrid[r][c] = solution[r][c];
      setGrid(newGrid);
      setHints((prev) => prev - 1);
    }
  };

  const resetGame = () => {
    setShowLevelModal(true);
    setSelectedCell(null);
  };

  // Helper to highlight related cells
  const getCellStyle = (r, c) => {
    if (!selectedCell) return null;
    const { r: selR, c: selC } = selectedCell;
    const isSameVal = grid[r][c] !== 0 && grid[r][c] === grid[selR][selC];
    const isRelated =
      r === selR ||
      c === selC ||
      (Math.floor(r / 3) === Math.floor(selR / 3) &&
        Math.floor(c / 3) === Math.floor(selC / 3));

    if (r === selR && c === selC) return styles.selectedCell;
    if (isSameVal) return styles.sameValueCell;
    if (isRelated) return styles.relatedCell;
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Loading Sudoku...</AppText>
      </View>
    );
  }

  if (gameCompleted) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.completeTitle}>🎉 Sudoku Master! 🎉</AppText>
        <AppText style={styles.completeScore}>Final Score: {score}</AppText>
        <TouchableOpacity
          style={styles.playAgainBtn}
          onPress={() => {
            setGameCompleted(false);
            setCurrentLevelIndex(0);
            setScore(0);
            setShowLevelModal(true);
          }}
        >
          <AppText style={styles.playAgainText}>Play Again</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selection Modal */}
      <Modal visible={showLevelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>
              Level {currentLevelIndex + 1} of {levels.length}
            </AppText>
            <AppText style={styles.modalSubtitle}>Choose Difficulty</AppText>
            {levels.map((level, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.levelBtn,
                  currentLevelIndex === index && styles.levelBtnSelected
                ]}
                onPress={() => {
                  setCurrentLevelIndex(index);
                  setDifficulty(level.difficulty);
                  generateSudoku(level);
                }}
              >
                <AppText style={styles.levelBtnText}>
                  {level.difficulty} - {level.hideCount} cells hidden
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Header Area */}
      <View style={[styles.header, { maxWidth: boardSize }]}>
        <View style={styles.headerBox}>
          <AppText style={styles.infoLabel}>LEVEL</AppText>
          <AppText style={styles.infoValue}>
            {currentLevelIndex + 1}/{levels.length}
          </AppText>
        </View>
        <View style={styles.headerBox}>
          <AppText style={styles.infoLabel}>TIME</AppText>
          <AppText style={styles.infoValue}>{formatTime(timer)}</AppText>
        </View>
        <View style={styles.headerBox}>
          <AppText style={styles.infoLabel}>HINTS</AppText>
          <AppText style={styles.infoValue}>{hints}</AppText>
        </View>
        <View style={styles.headerBox}>
          <AppText style={styles.infoLabel}>SCORE</AppText>
          <AppText style={styles.infoValue}>{score}</AppText>
        </View>
      </View>

      {/* Game Board */}
      <View
        style={[
          styles.sudokuContainer,
          { width: boardSize, height: boardSize },
        ]}
      >
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <TouchableOpacity
                key={c}
                activeOpacity={1}
                onPress={() => handleCellPress(r, c)}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  getCellStyle(r, c),
                  (r + 1) % 3 === 0 && r < 8 && styles.borderBottom,
                  (c + 1) % 3 === 0 && c < 8 && styles.borderRight,
                ]}
              >
                <AppText
                  style={[
                    styles.cellText,
                    { fontSize: cellSize * 0.5 },
                    initialGrid[r][c] !== 0
                      ? styles.fixedText
                      : styles.userInputText,
                    cell !== 0 && cell !== solution[r][c] && styles.errorText,
                  ]}
                >
                  {cell !== 0 ? cell : ""}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Input Controls */}
      <View style={[styles.inputSection, { width: boardSize }]}>
        <View style={styles.numPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.numBtn, { width: cellSize, height: cellSize }]}
              onPress={() => onNumberInput(num)}
            >
              <AppText style={styles.numBtnText}>{num}</AppText>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.numBtn,
              styles.eraseBtn,
              { width: cellSize * 2.2, height: cellSize },
            ]}
            onPress={() => onNumberInput(0)}
          >
            <Feather name="eraser" size={20} color={Colors.primary} />
            <AppText style={styles.eraseText}>Erase</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={useHint}>
            <Ionicons name="bulb-outline" size={20} color="#fff" />
            <AppText style={styles.actionBtnText}>Hint ({hints})</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#666" }]}
            onPress={resetGame}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <AppText style={styles.actionBtnText}>Levels</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  completeScore: {
    fontSize: 20,
    marginBottom: 30,
    color: Colors.text,
  },
  playAgainBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  headerBox: { alignItems: "center" },
  infoLabel: { fontSize: 10, color: "#999", fontWeight: "bold" },
  infoValue: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  sudokuContainer: {
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "white",
    overflow: "hidden",
  },
  row: { flexDirection: "row" },
  cell: {
    borderWidth: 0.5,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: { fontWeight: "400" },
  fixedText: { color: "#000", fontWeight: "bold" },
  userInputText: { color: Colors.primary },
  errorText: { color: "#FF4444" },
  borderRight: { borderRightWidth: 2, borderRightColor: "#333" },
  borderBottom: { borderBottomWidth: 2, borderBottomColor: "#333" },

  // Highlights
  selectedCell: { backgroundColor: Colors.primary + "40" },
  relatedCell: { backgroundColor: "#F0F0F0" },
  sameValueCell: { backgroundColor: Colors.primary + "20" },

  inputSection: { marginTop: 20 },
  numPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  numBtn: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  numBtnText: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  eraseBtn: { flexDirection: "row", gap: 5, backgroundColor: "#FFE0E0" },
  eraseText: { color: Colors.primary, fontWeight: "bold", fontSize: 14 },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  actionBtnText: { color: "#fff", fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "80%",
    maxWidth: 350,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  modalSubtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  levelBtn: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    marginVertical: 5,
    alignItems: "center",
  },
  levelBtnSelected: {
    backgroundColor: Colors.primary,
  },
  levelBtnText: { color: "#333", fontWeight: "bold", fontSize: 14 },
});