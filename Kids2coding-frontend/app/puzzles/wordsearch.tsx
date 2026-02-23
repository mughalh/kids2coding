import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AppText } from "../../src/components/AppText";
import { Colors } from "../../src/constants/colors";

const WORD_SEARCH_GRID = [
  ["C", "O", "D", "E", "P"],
  ["R", "U", "N", "T", "Y"],
  ["A", "P", "P", "L", "E"],
  ["M", "A", "I", "N", "S"],
  ["G", "O", "L", "A", "N"],
];

const TARGET_WORDS = ["CODE", "RUN", "APPLE", "MAIN", "GO"];

export default function WordSearchScreen() {
  const router = useRouter();
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [currentWord, setCurrentWord] = useState("");

  const handleCellPress = (row: number, col: number) => {
    const letter = WORD_SEARCH_GRID[row][col];
    const newWord = currentWord + letter;
    setCurrentWord(newWord);
    setSelectedCells([...selectedCells, { row, col }]);

    // Check if current word matches any target word
    const matchedWord = TARGET_WORDS.find(word => 
      word === newWord || 
      word === newWord.split('').reverse().join('')
    );

    if (matchedWord && !foundWords.includes(matchedWord)) {
      setFoundWords([...foundWords, matchedWord]);
      setCurrentWord("");
      setSelectedCells([]);
    } else if (newWord.length > Math.max(...TARGET_WORDS.map(w => w.length))) {
      // Reset if word too long
      setCurrentWord("");
      setSelectedCells([]);
    }
  };

  const resetSelection = () => {
    setCurrentWord("");
    setSelectedCells([]);
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>← Back to Puzzles</AppText>
        </TouchableOpacity>

        <AppText style={styles.title}>Word Search 🔍</AppText>
        <AppText style={styles.subtitle}>Find the hidden words</AppText>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <AppText style={styles.statLabel}>Found</AppText>
            <AppText style={styles.statValue}>{foundWords.length}/{TARGET_WORDS.length}</AppText>
          </View>
          <View style={styles.statBox}>
            <AppText style={styles.statLabel}>Current</AppText>
            <AppText style={styles.statValue}>{currentWord || "—"}</AppText>
          </View>
        </View>

        <View style={styles.grid}>
          {WORD_SEARCH_GRID.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((letter, colIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    isCellSelected(rowIndex, colIndex) && styles.selectedCell,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  <AppText style={styles.cellText}>{letter}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
          <AppText style={styles.resetText}>Reset Selection</AppText>
        </TouchableOpacity>

        <View style={styles.wordsList}>
          <AppText style={styles.wordsTitle}>Words to find:</AppText>
          <View style={styles.wordsContainer}>
            {TARGET_WORDS.map(word => (
              <View
                key={word}
                style={[
                  styles.wordTag,
                  foundWords.includes(word) && styles.foundWord,
                ]}
              >
                <AppText
                  style={[
                    styles.wordText,
                    foundWords.includes(word) && styles.foundWordText,
                  ]}
                >
                  {word}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {foundWords.length === TARGET_WORDS.length && (
          <View style={styles.victoryContainer}>
            <AppText style={styles.victoryText}>🎉 You found all words! 🎉</AppText>
          </View>
        )}
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
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
  grid: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
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
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCell: {
    backgroundColor: Colors.primary + "30",
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cellText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
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
  wordsList: {
    width: "100%",
    marginBottom: 30,
  },
  wordsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  wordTag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  foundWord: {
    backgroundColor: Colors.success,
  },
  wordText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  foundWordText: {
    color: "white",
  },
  victoryContainer: {
    backgroundColor: Colors.success,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  victoryText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});