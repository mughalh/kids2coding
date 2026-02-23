import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AppText } from "../../src/components/AppText";
import { Colors } from "../../src/constants/colors";

const MAZE = [
  ["S", "0", "1", "0", "0", "0"],
  ["1", "0", "1", "0", "1", "0"],
  ["0", "0", "0", "0", "1", "0"],
  ["0", "1", "1", "0", "1", "0"],
  ["0", "0", "0", "0", "0", "F"],
];

const CELL_SIZE = 50;

export default function MazeScreen() {
  const router = useRouter();
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [maze, setMaze] = useState(MAZE.map(row => [...row]));
  const [completed, setCompleted] = useState(false);
  const [moves, setMoves] = useState(0);

  const movePlayer = (direction: "up" | "down" | "left" | "right") => {
    if (completed) return;

    const { row, col } = playerPos;
    let newRow = row;
    let newCol = col;

    switch (direction) {
      case "up": newRow -= 1; break;
      case "down": newRow += 1; break;
      case "left": newCol -= 1; break;
      case "right": newCol += 1; break;
    }

    // Check boundaries
    if (newRow < 0 || newRow >= maze.length || newCol < 0 || newCol >= maze[0].length) {
      return;
    }

    // Check if wall
    if (maze[newRow][newCol] === "1") {
      return;
    }

    // Update position
    setPlayerPos({ row: newRow, col: newCol });
    setMoves(moves + 1);

    // Check if reached finish
    if (maze[newRow][newCol] === "F") {
      setCompleted(true);
    }
  };

  const resetGame = () => {
    setPlayerPos({ row: 0, col: 0 });
    setMaze(MAZE.map(row => [...row]));
    setCompleted(false);
    setMoves(0);
  };

  const getCellColor = (row: number, col: number) => {
    if (row === playerPos.row && col === playerPos.col) {
      return Colors.primary;
    }
    const cell = maze[row][col];
    if (cell === "1") return Colors.error;
    if (cell === "S") return Colors.success;
    if (cell === "F") return Colors.accent;
    return Colors.surface;
  };

  const getCellEmoji = (row: number, col: number) => {
    if (row === playerPos.row && col === playerPos.col) return "🤖";
    const cell = maze[row][col];
    if (cell === "S") return "🏁";
    if (cell === "F") return "🏆";
    if (cell === "1") return "🧱";
    return "";
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>← Back to Puzzles</AppText>
        </TouchableOpacity>

        <AppText style={styles.title}>Maze Runner 🌀</AppText>
        <AppText style={styles.subtitle}>Navigate the robot to the finish</AppText>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <AppText style={styles.statLabel}>Moves</AppText>
            <AppText style={styles.statValue}>{moves}</AppText>
          </View>
          {completed && (
            <View style={styles.victoryBadge}>
              <AppText style={styles.victoryText}>Completed!</AppText>
            </View>
          )}
        </View>

        <View style={styles.mazeContainer}>
          {maze.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    { backgroundColor: getCellColor(rowIndex, colIndex) },
                  ]}
                >
                  <AppText style={styles.cellText}>
                    {getCellEmoji(rowIndex, colIndex)}
                  </AppText>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("up")}>
              <AppText style={styles.controlText}>↑</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("left")}>
              <AppText style={styles.controlText}>←</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("down")}>
              <AppText style={styles.controlText}>↓</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer("right")}>
              <AppText style={styles.controlText}>→</AppText>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <AppText style={styles.resetText}>Reset Maze</AppText>
        </TouchableOpacity>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <AppText style={styles.legendText}>Robot</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <AppText style={styles.legendText}>Start</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <AppText style={styles.legendText}>Finish</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
            <AppText style={styles.legendText}>Wall</AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 30,
    textAlign: "center",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  victoryBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  victoryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  mazeContainer: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    fontSize: 20,
  },
  controls: {
    alignItems: "center",
    marginBottom: 30,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 5,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controlText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
  },
  resetText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});