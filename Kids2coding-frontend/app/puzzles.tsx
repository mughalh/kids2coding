import { useRouter } from "expo-router";
import { Filter, Puzzle, Search, Star, Timer, TrendingUp } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";

export default function PuzzlesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const puzzles = [
    {
      id: "1",
      title: "Fibonacci Sequence",
      description: "Generate the Fibonacci sequence up to n",
      difficulty: "easy",
      category: "algorithms",
      points: 50,
      timeLimit: 300,
      solved: true,
      emoji: "🐇",
      tags: ["math", "recursion"],
    },
    {
      id: "2",
      title: "Palindrome Checker",
      description: "Check if a string reads the same forwards and backwards",
      difficulty: "easy",
      category: "strings",
      points: 30,
      timeLimit: 180,
      solved: true,
      emoji: "🔤",
      tags: ["strings", "validation"],
    },
    {
      id: "3",
      title: "Sorting Algorithm",
      description: "Implement bubble sort algorithm",
      difficulty: "medium",
      category: "algorithms",
      points: 100,
      timeLimit: 600,
      solved: false,
      emoji: "📊",
      tags: ["sorting", "arrays"],
    },
    {
      id: "4",
      title: "Binary Search",
      description: "Find element in sorted array efficiently",
      difficulty: "medium",
      category: "search",
      points: 120,
      timeLimit: 480,
      solved: false,
      emoji: "🔍",
      tags: ["search", "arrays"],
    },
    {
      id: "5",
      title: "Maze Solver",
      description: "Find path through maze using DFS",
      difficulty: "hard",
      category: "graphs",
      points: 200,
      timeLimit: 900,
      solved: false,
      emoji: "🧩",
      tags: ["graphs", "recursion"],
    },
    {
      id: "6",
      title: "Prime Number Generator",
      description: "Generate all prime numbers up to n",
      difficulty: "medium",
      category: "math",
      points: 80,
      timeLimit: 420,
      solved: false,
      emoji: "🔢",
      tags: ["math", "optimization"],
    },
  ];

  const difficulties = [
    { id: "all", label: "All Levels", color: Colors.text },
    { id: "easy", label: "Easy", color: Colors.success },
    { id: "medium", label: "Medium", color: Colors.warning },
    { id: "hard", label: "Hard", color: Colors.error },
  ];

  const categories = [
    { id: "all", label: "All Categories", emoji: "📚" },
    { id: "algorithms", label: "Algorithms", emoji: "⚙️" },
    { id: "strings", label: "Strings", emoji: "🔤" },
    { id: "math", label: "Math", emoji: "🧮" },
    { id: "graphs", label: "Graphs", emoji: "📈" },
    { id: "search", label: "Search", emoji: "🔍" },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return Colors.success;
      case "medium":
        return Colors.warning;
      case "hard":
        return Colors.error;
      default:
        return Colors.text;
    }
  };

  const filteredPuzzles = puzzles.filter(puzzle => {
    const matchesSearch = puzzle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         puzzle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         puzzle.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === "all" || puzzle.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "all" || puzzle.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const stats = {
    total: puzzles.length,
    solved: puzzles.filter(p => p.solved).length,
    totalPoints: puzzles.reduce((sum, p) => sum + (p.solved ? p.points : 0), 0),
    averageTime: Math.round(puzzles.reduce((sum, p) => sum + p.timeLimit, 0) / puzzles.length / 60),
  };

  return (
    <ScreenWrapper>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <AppText style={styles.title}>Code Puzzles 🧩</AppText>
              <AppText style={styles.subtitle}>Solve coding challenges at your own pace</AppText>
            </View>
            <View style={styles.statsBadge}>
              <AppText style={styles.statsText}>{stats.solved}/{stats.total} solved</AppText>
            </View>
          </View>

          {/* Search */}
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
        </View>

        {/* Stats */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Puzzle size={20} color={Colors.primary} />
            <AppText style={styles.statValue}>{stats.total}</AppText>
            <AppText style={styles.statLabel}>Total Puzzles</AppText>
          </View>
          <View style={styles.statCard}>
            <Star size={20} color={Colors.warning} />
            <AppText style={styles.statValue}>{stats.solved}</AppText>
            <AppText style={styles.statLabel}>Solved</AppText>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.success} />
            <AppText style={styles.statValue}>{stats.totalPoints}</AppText>
            <AppText style={styles.statLabel}>Points Earned</AppText>
          </View>
          <View style={styles.statCard}>
            <Timer size={20} color={Colors.accent} />
            <AppText style={styles.statValue}>{stats.averageTime}min</AppText>
            <AppText style={styles.statLabel}>Avg. Time</AppText>
          </View>
        </ScrollView>

        {/* Difficulty Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {difficulties.map(diff => (
            <TouchableOpacity
              key={diff.id}
              style={[
                styles.difficultyFilter,
                selectedDifficulty === diff.id && styles.difficultyFilterActive,
                { borderColor: diff.color }
              ]}
              onPress={() => setSelectedDifficulty(diff.id)}
            >
              <View style={[
                styles.difficultyDot,
                { backgroundColor: diff.color }
              ]} />
              <AppText style={[
                styles.difficultyText,
                selectedDifficulty === diff.id && styles.difficultyTextActive
              ]}>
                {diff.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryFilter,
                selectedCategory === cat.id && styles.categoryFilterActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <AppText style={styles.categoryEmoji}>{cat.emoji}</AppText>
              <AppText style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive
              ]}>
                {cat.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Puzzles List */}
        <ScrollView style={styles.content}>
          {filteredPuzzles.map((puzzle, index) => (
            <TouchableOpacity
              key={puzzle.id}
              style={[
                styles.puzzleCard,
                puzzle.solved && styles.puzzleCardSolved
              ]}
              onPress={() => router.push(`/puzzles/${puzzle.id}`)}
            >
              <View style={styles.puzzleHeader}>
                <View style={styles.puzzleEmojiContainer}>
                  <AppText style={styles.puzzleEmoji}>{puzzle.emoji}</AppText>
                </View>
                <View style={styles.puzzleInfo}>
                  <AppText style={styles.puzzleTitle}>{puzzle.title}</AppText>
                  <AppText style={styles.puzzleDescription}>{puzzle.description}</AppText>
                </View>
                {puzzle.solved && (
                  <View style={styles.solvedBadge}>
                    <AppText style={styles.solvedText}>✓</AppText>
                  </View>
                )}
              </View>

              <View style={styles.puzzleDetails}>
                <View style={styles.puzzleTags}>
                  {puzzle.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <AppText style={styles.tagText}>{tag}</AppText>
                    </View>
                  ))}
                </View>

                <View style={styles.puzzleFooter}>
                  <View style={styles.puzzleMeta}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(puzzle.difficulty) + '20' }
                    ]}>
                      <AppText style={[
                        styles.difficultyBadgeText,
                        { color: getDifficultyColor(puzzle.difficulty) }
                      ]}>
                        {puzzle.difficulty.toUpperCase()}
                      </AppText>
                    </View>
                    <View style={styles.timeBadge}>
                      <Timer size={12} color={Colors.textLight} />
                      <AppText style={styles.timeText}>
                        {Math.floor(puzzle.timeLimit / 60)}:{puzzle.timeLimit % 60 < 10 ? '0' : ''}{puzzle.timeLimit % 60}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.pointsContainer}>
                    <Star size={16} color={Colors.warning} />
                    <AppText style={styles.pointsText}>{puzzle.points} pts</AppText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  statsBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statCard: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 5,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  difficultyFilter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  difficultyFilterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  difficultyTextActive: {
    color: "white",
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  categoryFilter: {
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
  },
  categoryFilterActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  categoryTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  puzzleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  puzzleCardSolved: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  puzzleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  puzzleEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  puzzleEmoji: {
    fontSize: 24,
  },
  puzzleInfo: {
    flex: 1,
  },
  puzzleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  puzzleDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  solvedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  solvedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  puzzleDetails: {
    marginTop: 10,
  },
  puzzleTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  tag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  puzzleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  puzzleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timeText: {
    marginLeft: 5,
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "600",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pointsText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.warning,
  },
});