import { useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AppText } from "../../src/components/AppText";
import { View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Colors } from "../../src/constants/colors";

// Games
import CodeRunner from "../../src/games/CodeRunner";
import FixTheBugGame from "../../src/games/FixTheBugGame";
import SyntaxPuzzle from "../../src/games/SyntaxPuzzle";
import MemoryMatch from "../../src/games/MemoryMatch";
import LogicMaze from "../../src/games/LogicMaze";
import AlgorithmRaceGame from "../../src/games/AlgorithmRaceGame";
import SudokuGame from "../../src/games/SudokuGame";
import TicTacToeGame from "../../src/games/TicTacToeGame";

const gameComponents = {
  "code-runner": CodeRunner,
  "fix-the-bug": FixTheBugGame,
  "syntax-puzzle": SyntaxPuzzle,
  "memory-match": MemoryMatch,
  "logic-maze": LogicMaze,
  "algorithm-race": AlgorithmRaceGame,
  "sudoku": SudokuGame,
  "tictactoe": TicTacToeGame
};

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleGameComplete = (won, score) => {
    console.log(`Game ${id} completed: ${won ? 'won' : 'lost'}, score: ${score}`);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  const GameComponent = gameComponents[id];
  
  if (!GameComponent) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <AppText style={{ fontSize: 22 }}>Coming Soon 🚧</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <GameComponent gameId={id} onGameComplete={handleGameComplete} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
});