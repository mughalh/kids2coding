import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import SudokuScreen from "./sudoku";
import WordSearchScreen from "./wordsearch";
import MazeScreen from "./maze";


// Map numeric IDs to the correct puzzle
const puzzleMap = {
  "1": "sudoku",
  "2": "wordsearch",
  "3": "maze",
};

const puzzleComponents = {
  sudoku: SudokuScreen,
  wordsearch: WordSearchScreen,
  maze: MazeScreen,
};

export default function PuzzleRouter() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Convert numeric ID to string ID
  const puzzleId = puzzleMap[id as keyof typeof puzzleMap];
  const PuzzleComponent = puzzleComponents[puzzleId as keyof typeof puzzleComponents];

  if (!PuzzleComponent) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <AppText style={styles.errorText}>Puzzle not found</AppText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <AppText style={styles.backText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return <PuzzleComponent />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backText: {
    color: "white",
    fontWeight: "600",
  },
});