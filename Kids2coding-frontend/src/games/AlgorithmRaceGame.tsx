import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AlgorithmRaceGame() {
  const [player, setPlayer] = useState({
    name: "Player1",
    avatar: "https://via.placeholder.com/40",
    points: 0,
    currency: 0,
    achievements: [] as string[],
  });

  const [currentView, setCurrentView] = useState<
    "lobby" | "challenge" | "feedback"
  >("lobby");
  const [currentChallenge, setCurrentChallenge] = useState<null | any>(null);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<null | any>(null);

  // 👇 1. State for the Instructions Modal
  const [showRules, setShowRules] = useState(true);

  const challenges = [
    {
      title: "Bubble Sort",
      statement: "Sort the array [5,2,9,1,5] using Bubble Sort.",
      correctSolution: "[1,2,5,5,9]",
      explanation: "Compare each element and swap iteratively.",
      timeLimit: 120,
    },
    {
      title: "Fibonacci",
      statement: "Find the 6th Fibonacci number.",
      correctSolution: "8",
      explanation: "Fibonacci sequence: 0,1,1,2,3,5,8...",
      timeLimit: 90,
    },
  ];

  useEffect(() => {
    if (currentView !== "challenge") return;
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, currentView]);

  const startChallenge = (challenge: any) => {
    setCurrentChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
    setInputValue("");
    setCurrentView("challenge");
    setFeedback(null);
  };

  const submitSolution = () => {
    if (!currentChallenge) return;
    const isCorrect = inputValue.trim() === currentChallenge.correctSolution;
    const pointsEarned = isCorrect ? 100 : 0;
    const currencyEarned = isCorrect ? 10 : 0;

    setPlayer((prev) => ({
      ...prev,
      points: prev.points + pointsEarned,
      currency: prev.currency + currencyEarned,
      achievements: isCorrect
        ? [...prev.achievements, currentChallenge.title]
        : prev.achievements,
    }));

    setFeedback({
      isCorrect,
      solution: currentChallenge.correctSolution,
      explanation: currentChallenge.explanation,
      points: pointsEarned,
    });

    setCurrentView("feedback");
  };

  const backToLobby = () => {
    setCurrentView("lobby");
    setCurrentChallenge(null);
    setFeedback(null);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 👇 2. Instructions Modal Popup */}
      <Modal visible={showRules} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Rules & Instructions 📜</Text>

            <View style={styles.rulesList}>
              <Text style={styles.ruleText}>
                1. Select a challenge from the lobby to begin.
              </Text>
              <Text style={styles.ruleText}>
                2. Each challenge has a specific time limit. Don't let the clock
                hit zero!
              </Text>
              <Text style={styles.ruleText}>
                3. Type your solution exactly as requested (e.g., [1,2,3]).
              </Text>
              <Text style={styles.ruleText}>
                4. Correct answers earn you Points, Currency, and Achievements.
              </Text>
              <Text style={styles.ruleText}>
                5. You can "Give Up" at any time, but you won't earn any points.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowRules(false)}
            >
              <Text style={styles.startButtonText}>Start Racing! 🏁</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Algorithm Race 🏁</Text>

          <View style={styles.playerInfo}>
            <Image source={{ uri: player.avatar }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.playerText}>{player.name}</Text>
              <Text style={styles.statsText}>
                Points: {player.points} | 💰 {player.currency}
              </Text>
            </View>
            {/* Help button to re-open rules */}
            <TouchableOpacity onPress={() => setShowRules(true)}>
              <Text style={{ fontSize: 24 }}>❓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentView === "lobby" && (
          <View>
            <Text style={styles.subtitle}>Available Challenges</Text>
            {challenges.map((c, idx) => (
              <View key={idx} style={styles.challengeCard}>
                <Text style={styles.challengeTitle}>{c.title}</Text>
                <Text style={styles.challengeTime}>⏳ {c.timeLimit}s</Text>
                <Button
                  title="Race Now"
                  onPress={() => startChallenge(c)}
                  color="#4CAF50"
                />
              </View>
            ))}

            <View style={styles.statsCard}>
              <Text style={styles.subtitle}>Achievements 🏆</Text>
              <Text style={{ color: "#666" }}>
                {player.achievements.join(" • ") ||
                  "No achievements yet. Win a race!"}
              </Text>
            </View>
          </View>
        )}

        {currentView === "challenge" && currentChallenge && (
          <View style={styles.gameCard}>
            <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
            <Text style={styles.statement}>{currentChallenge.statement}</Text>
            <Text style={styles.timer}>Time Remaining: {timeLeft}s</Text>

            <TextInput
              style={styles.input}
              multiline
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Type your solution..."
              placeholderTextColor="#999"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitSolution}
              >
                <Text style={styles.btnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.giveUpBtn} onPress={backToLobby}>
                <Text style={styles.btnText}>Give Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentView === "feedback" && feedback && (
          <View style={[styles.gameCard, { alignItems: "center" }]}>
            <Text
              style={[
                styles.feedbackTitle,
                { color: feedback.isCorrect ? "#4CAF50" : "#F44336" },
              ]}
            >
              {feedback.isCorrect ? "MISSION ACCOMPLISHED! ✅" : "CRASHED! ❌"}
            </Text>
            <Text style={styles.feedbackPoints}>+{feedback.points} Points</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Correct Answer:</Text>
              <Text style={styles.infoText}>{feedback.solution}</Text>
              <Text style={[styles.infoLabel, { marginTop: 10 }]}>Logic:</Text>
              <Text style={styles.infoText}>{feedback.explanation}</Text>
            </View>

            <TouchableOpacity style={styles.lobbyBtn} onPress={backToLobby}>
              <Text style={styles.btnText}>Return to Garage</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5" },
  header: { marginBottom: 20 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 20,
    textAlign: "center",
    color: "#333",
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  playerText: { fontSize: 18, fontWeight: "bold" },
  statsText: { color: "#666" },
  subtitle: {
    fontSize: 22,
    marginVertical: 15,
    fontWeight: "bold",
    color: "#444",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2196F3",
  },
  rulesList: { width: "100%", marginBottom: 25 },
  ruleText: { fontSize: 16, marginBottom: 12, color: "#444", lineHeight: 22 },
  startButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  startButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // Game Styles
  challengeCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  challengeTitle: { fontSize: 20, fontWeight: "bold" },
  challengeTime: { color: "#666", marginBottom: 10 },
  statsCard: {
    marginTop: 20,
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 10,
  },
  gameCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    elevation: 4,
  },
  statement: { fontSize: 18, marginVertical: 15, color: "#333" },
  timer: {
    fontSize: 20,
    color: "#F44336",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  submitBtn: {
    backgroundColor: "#4CAF50",
    flex: 0.6,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  giveUpBtn: {
    backgroundColor: "#F44336",
    flex: 0.35,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  feedbackTitle: { fontSize: 22, fontWeight: "bold" },
  feedbackPoints: { fontSize: 30, fontWeight: "bold", marginVertical: 10 },
  infoBox: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginVertical: 20,
  },
  infoLabel: { fontWeight: "bold", color: "#666" },
  infoText: { fontSize: 16, color: "#333" },
  lobbyBtn: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
});
