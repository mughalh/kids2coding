import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Maze legend:
// 'S' = Start, 'F' = Finish, 0 = path, 1 = wall, '*' = collectible star, 'P' = puzzle
const initialMaze = [
  ["S", 0, 1, "*", "P"],
  [1, 0, 1, 0, 1],
  ["*", 0, 0, 0, 1],
  [0, 1, "*", 0, 0],
  [0, "P", 0, 1, "F"],
];

export default function LogicMazePro() {
  const [maze, setMaze] = useState(JSON.parse(JSON.stringify(initialMaze)));
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [path, setPath] = useState([{ row: 0, col: 0 }]);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(30);
  const [puzzleActive, setPuzzleActive] = useState(false);

  // 👇 Added state for start-up instructions
  const [showInstructions, setShowInstructions] = useState(true);

  const movePlayer = (direction) => {
    if (puzzleActive || showInstructions) return; // cannot move while puzzle or instructions are active

    const { row, col } = playerPos;
    let newRow = row;
    let newCol = col;

    if (direction === "up") newRow -= 1;
    if (direction === "down") newRow += 1;
    if (direction === "left") newCol -= 1;
    if (direction === "right") newCol += 1;

    // Check boundaries
    if (
      newRow < 0 ||
      newRow >= maze.length ||
      newCol < 0 ||
      newCol >= maze[0].length
    )
      return;

    const cell = maze[newRow][newCol];
    if (cell === 1) return; // wall

    if (movesLeft <= 0) {
      Alert.alert("❌ Out of moves!", "Restart to try again.");
      return;
    }

    setMovesLeft((prev) => prev - 1);

    const newMaze = maze.map((row) => [...row]);

    // Collect star
    if (cell === "*") {
      setScore((prev) => prev + 10);
      newMaze[newRow][newCol] = 0;
      setMaze(newMaze);
    }

    // **Update player position first**
    setPlayerPos({ row: newRow, col: newCol });
    setPath([...path, { row: newRow, col: newCol }]);

    // **Check finish AFTER updating position**
    if (cell === "F") {
      Alert.alert(
        "🏆 Game Complete!",
        `Congratulations! Your score: ${score} | Moves left: ${movesLeft}`,
        [{ text: "OK", onPress: resetGame }],
        { cancelable: false },
      );
    }

    // Puzzle handling
    if (cell === "P") {
      setPuzzleActive(true);
    }
  };

  // Solve puzzle
  const solvePuzzle = () => {
    Alert.alert("✅ Puzzle Solved!", "You unlocked a new path!");
    setPuzzleActive(false);

    // Example: unlock a wall below the puzzle
    const newMaze = maze.map((row) => [...row]);
    const { row, col } = playerPos;
    if (row + 1 < maze.length && newMaze[row + 1][col] === 1)
      newMaze[row + 1][col] = 0;
    setMaze(newMaze);
  };

  // Reset game
  const resetGame = () => {
    setMaze(JSON.parse(JSON.stringify(initialMaze)));
    setPlayerPos({ row: 0, col: 0 });
    setPath([{ row: 0, col: 0 }]);
    setScore(0);
    setMovesLeft(30);
    setPuzzleActive(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 👇 New Start-up Instructions Modal */}
      <Modal visible={showInstructions} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.instructionsBox}>
            <Text style={styles.modalTitle}>How to Play 🎮</Text>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#6c5ce7" }]} />
              <Text style={styles.legendText}> S: Starting Point</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#00b894" }]} />
              <Text style={styles.legendText}> F: Finish Goal</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#2d3436" }]} />
              <Text style={styles.legendText}> 1: Wall (Impassable)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#fd79a8" }]} />
              <Text style={styles.legendText}> *: Collectible (+10 pts)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.miniCell, { backgroundColor: "#ffeaa7" }]} />
              <Text style={styles.legendText}>
                {" "}
                P: Logic Puzzle (Unlocks path)
              </Text>
            </View>

            <Text style={styles.instructionNote}>
              Goal: Reach 'F' before you run out of moves!
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.buttonText}>Start Game 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Pro Logic Maze 🎯</Text>
      <Text style={styles.info}>
        Score: {score} | Moves left: {movesLeft}
      </Text>

      {/* Maze Grid */}
      <View style={styles.grid}>
        {maze.map((rowArr, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {rowArr.map((cell, colIndex) => {
              const isPlayer =
                playerPos.row === rowIndex && playerPos.col === colIndex;
              const isPath = path.some(
                (p) => p.row === rowIndex && p.col === colIndex,
              );

              let bgColor = "#fff";
              if (cell === 1) bgColor = "#2d3436";
              if (cell === "S") bgColor = "#6c5ce7";
              if (cell === "F") bgColor = "#00b894";
              if (cell === "*") bgColor = "#fd79a8";
              if (cell === "P") bgColor = "#ffeaa7";
              if (isPlayer) bgColor = "#fdcb6e";
              if (isPath && !isPlayer) bgColor = "#dfe6e9";

              return (
                <View
                  key={colIndex}
                  style={[styles.cell, { backgroundColor: bgColor }]}
                >
                  <Text style={styles.cellText}>
                    {cell === 0 || cell === 1 ? "" : cell}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => movePlayer("up")}
        >
          <Text style={styles.buttonText}>↑</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => movePlayer("left")}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => movePlayer("down")}
          >
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => movePlayer("right")}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.restartButton} onPress={resetGame}>
          <Text style={styles.buttonText}>Restart 🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Existing Puzzle Modal */}
      <Modal visible={puzzleActive} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.instructionsBox}>
            <Text style={styles.modalText}>
              Solve the puzzle to unlock the path!
            </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    paddingTop: 40,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 18, marginBottom: 15 },
  grid: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#b2bec3",
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: { fontSize: 18, fontWeight: "bold" },
  controls: { marginTop: 30, alignItems: "center" },
  button: {
    margin: 5,
    backgroundColor: "#6c5ce7",
    padding: 15,
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
  },
  restartButton: {
    marginTop: 15,
    backgroundColor: "#00b894",
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: { fontSize: 20, color: "#fff", fontWeight: "bold" },

  // Modal & Instructions Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionsBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6c5ce7",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  miniCell: { width: 20, height: 20, borderRadius: 4, marginRight: 10 },
  legendText: { fontSize: 16, color: "#2d3436" },
  instructionNote: {
    marginVertical: 20,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#6c5ce7",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },

  modalText: {
    fontSize: 22,
    color: "#2d3436",
    marginBottom: 20,
    textAlign: "center",
  },
  solveButton: { backgroundColor: "#fdcb6e", padding: 15, borderRadius: 10 },
});
