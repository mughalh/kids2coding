import { useRouter } from "expo-router";
import { Filter, Grid, List, Search, Puzzle } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";

export default function PuzzlesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const puzzles = [
    {
      id: "sudoku",
      title: "Sudoku",
      description: "Classic number puzzle game",
      difficulty: "intermediate",
      category: "logic",
      emoji: "🧩",
      color: "#6c5ce7",
      bgColor: "#F0EBFF",
      timeEstimate: "15-30 min",
      completed: false,
    },
    {
      id: "wordsearch",
      title: "Word Search",
      description: "Find hidden words in a grid",
      difficulty: "beginner",
      category: "vocabulary",
      emoji: "🔍",
      color: "#00b894",
      bgColor: "#E0F7E9",
      timeEstimate: "5-15 min",
      completed: false,
    },
    {
      id: "maze",
      title: "Maze Runner",
      description: "Navigate through complex mazes",
      difficulty: "intermediate",
      category: "logic",
      emoji: "🌀",
      color: "#fdcb6e",
      bgColor: "#FFF4DB",
      timeEstimate: "10-20 min",
      completed: false,
    },
  ];

  const difficulties = [
    { id: "all", label: "All" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  const filteredPuzzles = puzzles.filter(puzzle => {
    const matchesSearch = puzzle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         puzzle.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || puzzle.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return Colors.success;
      case "intermediate": return Colors.warning;
      case "advanced": return Colors.error;
      default: return Colors.text;
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <AppText style={styles.title}>Puzzle Zone 🧩</AppText>
            <AppText style={styles.subtitle}>Challenge your brain with fun puzzles</AppText>
          </View>
          <View style={styles.viewControls}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === "grid" && styles.viewButtonActive]}
              onPress={() => setViewMode("grid")}
            >
              <Grid size={20} color={viewMode === "grid" ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === "list" && styles.viewButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <List size={20} color={viewMode === "list" ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search puzzles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {difficulties.map(diff => (
            <TouchableOpacity
              key={diff.id}
              style={[
                styles.filter,
                selectedDifficulty === diff.id && styles.filterActive,
              ]}
              onPress={() => setSelectedDifficulty(diff.id)}
            >
              <AppText style={[
                styles.filterText,
                selectedDifficulty === diff.id && styles.filterTextActive,
              ]}>
                {diff.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredPuzzles.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText style={styles.emptyEmoji}>🔍</AppText>
            <AppText style={styles.emptyTitle}>No puzzles found</AppText>
            <AppText style={styles.emptyText}>Try a different search</AppText>
          </View>
        ) : viewMode === "grid" ? (
          <View style={styles.grid}>
            {filteredPuzzles.map(puzzle => (
              <TouchableOpacity
                key={puzzle.id}
                style={[styles.puzzleCard, { backgroundColor: puzzle.bgColor }]}
                onPress={() => router.push(`/puzzles/${puzzle.id}`)}
              >
                <View style={[styles.puzzleEmojiContainer, { backgroundColor: puzzle.color + "20" }]}>
                  <AppText style={styles.puzzleEmoji}>{puzzle.emoji}</AppText>
                </View>
                <AppText style={styles.puzzleTitle}>{puzzle.title}</AppText>
                <AppText style={styles.puzzleDescription} numberOfLines={2}>
                  {puzzle.description}
                </AppText>
                <View style={styles.puzzleFooter}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(puzzle.difficulty) + "20" }]}>
                    <AppText style={[styles.difficultyText, { color: getDifficultyColor(puzzle.difficulty) }]}>
                      {puzzle.difficulty}
                    </AppText>
                  </View>
                  <AppText style={styles.timeText}>⏱️ {puzzle.timeEstimate}</AppText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredPuzzles.map(puzzle => (
              <TouchableOpacity
                key={puzzle.id}
                style={styles.listItem}
                onPress={() => router.push(`/puzzles/${puzzle.id}`)}
              >
                <View style={[styles.listEmoji, { backgroundColor: puzzle.color + "20" }]}>
                  <AppText style={styles.listEmojiText}>{puzzle.emoji}</AppText>
                </View>
                <View style={styles.listInfo}>
                  <AppText style={styles.listTitle}>{puzzle.title}</AppText>
                  <AppText style={styles.listDescription}>{puzzle.description}</AppText>
                  <View style={styles.listMeta}>
                    <View style={[styles.listDifficulty, { backgroundColor: getDifficultyColor(puzzle.difficulty) + "20" }]}>
                      <AppText style={[styles.listDifficultyText, { color: getDifficultyColor(puzzle.difficulty) }]}>
                        {puzzle.difficulty}
                      </AppText>
                    </View>
                    <AppText style={styles.listTime}>⏱️ {puzzle.timeEstimate}</AppText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 5,
  },
  viewControls: {
    flexDirection: "row",
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: Colors.surface,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: "100%",
  },
  filterButton: {
    padding: 8,
  },
  filters: {
    marginBottom: 20,
  },
  filter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    marginRight: 10,
  },
  filterActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  puzzleCard: {
    width: "48%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  puzzleEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  puzzleEmoji: {
    fontSize: 24,
  },
  puzzleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  puzzleDescription: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
    marginBottom: 15,
  },
  puzzleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 10,
    color: Colors.textLight,
  },
  list: {
    gap: 15,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listEmoji: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  listEmojiText: {
    fontSize: 30,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  listDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  listDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listDifficultyText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  listTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
  },
});