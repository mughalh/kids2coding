import { useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AppText } from "../../src/components/AppText";
import { View, StyleSheet } from "react-native";

// Games
import CodeRunner from "../../src/games/CodeRunner";
import FixTheBugGame from "../../src/games/FixTheBugGame";
import SyntaxPuzzle from "../../src/games/SyntaxPuzzle";
import MemoryMatch from "../../src/games/MemoryMatch";  
import LogicMaze from "../../src/games/LogicMaze"
import AlgorithmRaceGame from "../../src/games/AlgorithmRaceGame";

export default function GameScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ScreenWrapper scrollable>
      {id === "1" && <CodeRunner />}
      {id === "2" && <FixTheBugGame />}
      {id === "3" && <SyntaxPuzzle />}
      {id === "4" && <MemoryMatch />}
      {id ==="5" && <LogicMaze/>}
      {id === "6" && <AlgorithmRaceGame />}   

      {id !== "1" && id !== "2" && id !== "3" && id !== "4" &&id !== "5" &&id !== "6" && (
        <View style={styles.center}>
          <AppText style={{ fontSize: 22 }}>Coming Soon 🚧</AppText>
        </View>
      )}
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
