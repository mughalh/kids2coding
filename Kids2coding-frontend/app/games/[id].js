import { useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AppText } from "../../src/components/AppText";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Colors } from "../../src/constants/colors";
import { useRouter } from "expo-router";
import { Home, Gamepad2, Puzzle, Bot, User, ChevronLeft } from "lucide-react-native";

// Games
import CodeRunner from "../../src/games/CodeRunner";
import FixTheBugGame from "../../src/games/FixTheBugGame";
import SyntaxPuzzle from "../../src/games/SyntaxPuzzle";
import MemoryMatch from "../../src/games/MemoryMatch";
import LogicMaze from "../../src/games/LogicMaze";
import AlgorithmRaceGame from "../../src/games/AlgorithmRaceGame";
import SudokuGame from "../../src/games/SudokuGame";
import TicTacToeGame from "../../src/games/TicTacToeGame";
import { useAppContext } from "../../src/contexts/AppContext";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // ✅ Move useAppContext INSIDE the component
  const { setCurrentContext } = useAppContext();

  // ✅ Set context when game loads
  useEffect(() => {
    if (id) {
      setCurrentContext('game', { gameId: id });
    }
    
    return () => {
      setCurrentContext('game', { gameId: null });
    };
  }, [id]);

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
    <ScreenWrapper scrollable>
      {Platform.OS === 'android' && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}
      <GameComponent gameId={id} onGameComplete={handleGameComplete} />
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/dashboard")}
        >
          <Home size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>Home</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/games")}
        >
          <Gamepad2 size={24} color={Colors.primary} />
          <AppText style={[styles.navLabel, { color: Colors.primary }]}>Games</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/puzzles")}
        >
          <Puzzle size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>Puzzles</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/ai-buddy")}
        >
          <Bot size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>AI</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/profile")}
        >
          <User size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>Profile</AppText>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
});