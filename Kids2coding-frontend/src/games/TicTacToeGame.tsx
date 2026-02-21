import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    View,
    ActivityIndicator,
} from "react-native";
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";
import { useProgress } from "../hooks/useProgress";
import { getGameLevels } from "../services/gamesService";

const { width } = Dimensions.get("window");
const BOARD_SIZE = Math.min(width * 0.88, 420);
const CELL_SIZE = BOARD_SIZE / 3;

export default function TicTacToeGame({ gameId, onGameComplete }) {
  const { saveGameProgress, getGameProgress } = useProgress();

  // --- STATE ---
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [gameMode, setGameMode] = useState("AI");
  const [difficulty, setDifficulty] = useState("Pro");
  const [sessionStats, setSessionStats] = useState({ wins: 0, cpu: 0, draws: 0 });
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // --- ANIMATION REFS ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const gateAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load levels from Firebase
  useEffect(() => {
    loadLevels();
  }, [gameId]);

  const loadLevels = async () => {
    try {
      const levelsData = await getGameLevels(gameId);
      setLevels(levelsData);
      
      if (levelsData.length > 0) {
        setCurrentLevel(levelsData[0]);
        setDifficulty(levelsData[0].difficulty);
        
        // Set gatekeeper question from level data
        if (levelsData[0].gatekeeperQuestions) {
          const questions = levelsData[0].gatekeeperQuestions;
          setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
        }
      }

      // Check for saved progress
      const savedProgress = getGameProgress(gameId);
      if (savedProgress && !savedProgress.completed) {
        const savedLevel = savedProgress.currentLevel || 0;
        setCurrentLevelIndex(savedLevel);
        setScore(savedProgress.score || 0);
        setSessionStats(savedProgress.stats || { wins: 0, cpu: 0, draws: 0 });
        if (levelsData[savedLevel]) {
          setCurrentLevel(levelsData[savedLevel]);
          setDifficulty(levelsData[savedLevel].difficulty);
        }
      }
    } catch (error) {
      console.error("Error loading levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLevel && !currentQuestion && !isUnlocked) {
      // Fallback questions if not in level data
      const fallbackQuestions = [
        { q: "What is 15 + 7?", a: "22", choices: ["20", "22", "25", "18"] },
        { q: "In coding, what does '//' mean?", a: "Comment", choices: ["Divide", "Multiply", "Comment", "Add"] },
        { q: "Which symbol is for 'Equal to'?", a: "==", choices: ["=", "==", "++", "!="] },
        { q: "What is 10 * 3?", a: "30", choices: ["13", "30", "300", "7"] },
        { q: "What is a 'Boolean'?", a: "True/False", choices: ["Number", "Text", "True/False", "Loop"] },
      ];
      setCurrentQuestion(fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]);
    }
  }, [currentLevel]);

  // Turn Pulse Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  }, []);

  // AI Move Trigger
  useEffect(() => {
    if (
      isUnlocked &&
      gameMode === "AI" &&
      !isXNext &&
      !winner &&
      board.includes(null) &&
      !gameCompleted
    ) {
      const timer = setTimeout(() => makeAIMove(), 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, isUnlocked, gameMode, gameCompleted]);

  // --- GATEKEEPER LOGIC ---
  const handleAnswer = (choice) => {
    if (choice === currentQuestion.a) {
      // Success! Unlock the game
      Animated.timing(gateAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsUnlocked(true);
      });
    } else {
      // Wrong Answer
      Vibration.vibrate(500);
      alert("❌ Incorrect! Try again to unlock the game.");
    }
  };

  // --- GAME LOGIC ---
  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], line };
      }
    }
    return squares.includes(null) ? null : { winner: "Draw", line: [] };
  };

  const handlePress = (index) => {
    if (board[index] || winner || !isUnlocked || gameCompleted) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    const result = checkWinner(newBoard);
    if (result) handleEndGame(result);
    else setIsXNext(!isXNext);
  };

  const handleEndGame = (result) => {
    setWinner(result.winner);
    setWinningLine(result.line);
    
    const xpEarned = currentLevel?.xpReward || 10;
    let newScore = score;
    let newStats = { ...sessionStats };

    if (result.winner === "X") {
      newStats.wins += 1;
      newScore += xpEarned;
    } else if (result.winner === "O") {
      newStats.cpu += 1;
    } else {
      newStats.draws += 1;
      newScore += Math.floor(xpEarned / 2);
    }

    setScore(newScore);
    setSessionStats(newStats);
    saveGameProgress(gameId, currentLevelIndex, newScore, false, newStats);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Check if level complete (best of 3 or specific win condition)
    if (newStats.wins >= (currentLevel?.winsToComplete || 3)) {
      loadNextLevel();
    }
  };

  const loadNextLevel = () => {
    const nextIndex = currentLevelIndex + 1;
    
    if (nextIndex < levels.length) {
      setCurrentLevelIndex(nextIndex);
      setCurrentLevel(levels[nextIndex]);
      setDifficulty(levels[nextIndex].difficulty);
      resetBoard();
      saveGameProgress(gameId, nextIndex, score, false, sessionStats);
    } else {
      // Game complete
      setGameCompleted(true);
      onGameComplete?.(true, score);
      saveGameProgress(gameId, nextIndex, score, true, sessionStats);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
    fadeAnim.setValue(0);
  };

  const resetGame = () => {
    setIsUnlocked(false);
    gateAnim.setValue(1);
    resetBoard();
    
    // New question
    if (currentLevel?.gatekeeperQuestions) {
      const questions = currentLevel.gatekeeperQuestions;
      setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
    }
  };

  const makeAIMove = () => {
    const bestMove =
      difficulty === "Pro" ? minimax(board, "O").index : getRandomMove();
    handlePress(bestMove);
  };

  const getRandomMove = () => {
    const avail = board
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);
    return avail[Math.floor(Math.random() * avail.length)];
  };

  function minimax(newBoard, player) {
    const availSpots = newBoard
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);
    const result = checkWinner(newBoard);
    if (result?.winner === "X") return { score: -10 };
    if (result?.winner === "O") return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };
    
    const moves = [];
    for (let spot of availSpots) {
      let move = { index: spot };
      newBoard[spot] = player;
      move.score =
        player === "O"
          ? minimax(newBoard, "X").score
          : minimax(newBoard, "O").score;
      newBoard[spot] = null;
      moves.push(move);
    }
    
    let bestMove;
    if (player === "O") {
      let bestScore = -Infinity;
      moves.forEach((m, i) => {
        if (m.score > bestScore) {
          bestScore = m.score;
          bestMove = i;
        }
      });
    } else {
      let bestScore = Infinity;
      moves.forEach((m, i) => {
        if (m.score < bestScore) {
          bestScore = m.score;
          bestMove = i;
        }
      });
    }
    return moves[bestMove];
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Loading Tic Tac Toe...</AppText>
      </View>
    );
  }

  if (gameCompleted) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.completeTitle}>🎮 Tic Tac Toe Master! 🎮</AppText>
        <AppText style={styles.completeScore}>Final Score: {score}</AppText>
        <TouchableOpacity
          style={styles.playAgainBtn}
          onPress={() => {
            setGameCompleted(false);
            setCurrentLevelIndex(0);
            setScore(0);
            setSessionStats({ wins: 0, cpu: 0, draws: 0 });
            resetGame();
          }}
        >
          <AppText style={styles.playAgainText}>Play Again</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // --- RENDER GATEKEEPER ---
  if (!isUnlocked && currentQuestion) {
    return (
      <Animated.View style={[styles.gateContainer, { opacity: gateAnim }]}>
        <View style={styles.gateCard}>
          <MaterialCommunityIcons
            name="lock-open-variant-outline"
            size={50}
            color={Colors.primary}
          />
          <AppText style={styles.gateTitle}>Level {currentLevelIndex + 1}</AppText>
          <AppText style={styles.gateQuestion}>{currentQuestion.q}</AppText>
          <View style={styles.choiceGrid}>
            {currentQuestion.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={styles.choiceBtn}
                onPress={() => handleAnswer(choice)}
              >
                <AppText style={styles.choiceText}>{choice}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  }

  // --- RENDER GAME ---
  return (
    <View style={styles.container}>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreCard}>
          <AppText style={styles.scoreLabel}>CODER</AppText>
          <AppText style={styles.scoreNum}>{sessionStats.wins}</AppText>
        </View>
        <View style={[styles.scoreCard, { borderColor: "#999" }]}>
          <AppText style={styles.scoreLabel}>DRAWS</AppText>
          <AppText style={styles.scoreNum}>{sessionStats.draws}</AppText>
        </View>
        <View style={[styles.scoreCard, { borderColor: Colors.accent }]}>
          <AppText style={styles.scoreLabel}>ROBOT</AppText>
          <AppText style={styles.scoreNum}>{sessionStats.cpu}</AppText>
        </View>
      </View>

      <View style={styles.levelInfo}>
        <AppText style={styles.levelText}>
          Level {currentLevelIndex + 1}/{levels.length} • {difficulty}
        </AppText>
        <AppText style={styles.scoreText}>Score: {score}</AppText>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.tglBtn, gameMode === "AI" && styles.tglActive]}
          onPress={() => {
            setGameMode("AI");
            resetBoard();
          }}
        >
          <AppText
            style={[styles.tglText, gameMode === "AI" && styles.tglTextActive]}
          >
            VS ROBOT
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tglBtn, gameMode === "Local" && styles.tglActive]}
          onPress={() => {
            setGameMode("Local");
            resetBoard();
          }}
        >
          <AppText
            style={[
              styles.tglText,
              gameMode === "Local" && styles.tglTextActive,
            ]}
          >
            PVP MODE
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.statusArea}>
        {winner ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <AppText style={styles.victoryText}>
              {winner === "Draw"
                ? "💻 STALEMATE"
                : `🎉 ${winner === "X" ? "CODER" : "ROBOT"} WINS!`}
            </AppText>
          </Animated.View>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <AppText style={styles.turnText}>
              WAITING FOR:{" "}
              <AppText
                style={{ color: isXNext ? Colors.primary : Colors.accent }}
              >
                {isXNext ? "CODER" : "ROBOT"}
              </AppText>
            </AppText>
          </Animated.View>
        )}
      </View>

      <View style={styles.boardWrapper}>
        <View style={styles.board}>
          {board.map((cell, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                winningLine.includes(i) && styles.winningCell,
                i % 3 !== 2 && styles.borderRight,
                i < 6 && styles.borderBottom,
              ]}
              onPress={() => handlePress(i)}
            >
              {cell === "X" && (
                <MaterialCommunityIcons
                  name="xml"
                  size={CELL_SIZE * 0.5}
                  color={Colors.primary}
                />
              )}
              {cell === "O" && (
                <MaterialCommunityIcons
                  name="robot"
                  size={CELL_SIZE * 0.5}
                  color={Colors.accent}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
          <Ionicons name="refresh-circle" size={30} color="white" />
          <AppText style={styles.resetBtnText}>NEW CHALLENGE</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FB",
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
  levelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 10,
  },
  levelText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  scoreText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: "600",
  },
  // Gatekeeper Styles
  gateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    width: "100%",
    padding: 20,
  },
  gateCard: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333",
  },
  gateQuestion: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 25,
    textAlign: "center",
    fontWeight: "600",
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  choiceBtn: {
    backgroundColor: "#F0F0F0",
    width: "45%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  choiceText: { fontSize: 16, fontWeight: "bold", color: "#444" },
  // Game Styles
  scoreBoard: { flexDirection: "row", gap: 10, marginBottom: 10 },
  scoreCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
    width: width * 0.26,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  scoreLabel: { fontSize: 10, fontWeight: "bold", color: "#666" },
  scoreNum: { fontSize: 20, fontWeight: "900" },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#D1D9E6",
    borderRadius: 25,
    padding: 5,
    marginBottom: 10,
  },
  tglBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  tglActive: { backgroundColor: Colors.primary },
  tglText: { fontSize: 12, fontWeight: "900", color: "#666" },
  tglTextActive: { color: "#fff" },
  statusArea: { height: 40, justifyContent: "center", marginBottom: 10 },
  turnText: { fontSize: 14, fontWeight: "bold" },
  victoryText: { fontSize: 18, fontWeight: "900", color: Colors.primary },
  boardWrapper: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 25,
    elevation: 5,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  borderRight: { borderRightWidth: 3, borderRightColor: "#F0F0F0" },
  borderBottom: { borderBottomWidth: 3, borderBottomColor: "#F0F0F0" },
  winningCell: { backgroundColor: Colors.primary + "15" },
  footer: { marginTop: 20 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  resetBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});