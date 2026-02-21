import { useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AppText } from "../../src/components/AppText";
import { Colors } from "../../src/constants/colors";
import SudokuGame from "../../src/games/SudokuGame";

export default function SudokuScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>← Back to Puzzles</AppText>
        </TouchableOpacity>
        <SudokuGame />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
});