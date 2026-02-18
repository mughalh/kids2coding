import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";

const syntaxPuzzleLevel = {
  codeWithBugs: `for i=1; i<=5; i++
console.log(i)`,
  expectedOutput: "1\n2\n3\n4\n5",
  hint: "Add 'let' before 'i', add '{ }' brackets and missing semicolons.",
};

export default function SyntaxPuzzle() {
  const [code, setCode] = useState(syntaxPuzzleLevel.codeWithBugs);
  const [output, setOutput] = useState("");
  const [showInstructions, setShowInstructions] = useState(true); // 2. State for popup

  const runPuzzle = () => {
    let outputStr = "";
    const originalLog = console.log;

    try {
      console.log = (...args) => {
        outputStr += args.join(" ") + "\n";
      };

      eval(code);

      if (outputStr.trim() === syntaxPuzzleLevel.expectedOutput) {
        Alert.alert("🎉 Success!", "Syntax fixed! Well done 😎");
      } else {
        Alert.alert("⚠️ Almost!", "Code runs, but output is not correct.");
      }

      setOutput(outputStr.trim());
    } catch (err) {
      Alert.alert("🐞 Syntax Error!", "Fix the code syntax and try again.");
      setOutput("");
    } finally {
      console.log = originalLog;
    }
  };

  const showHint = () => {
    Alert.alert("💡 Hint", syntaxPuzzleLevel.hint);
  };

  const resetCode = () => {
    setCode(syntaxPuzzleLevel.codeWithBugs);
    setOutput("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 👇 Instructions Modal Popup */}
      <Modal visible={showInstructions} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Mission: Syntax Fix 🧩</AppText>

            <View style={styles.rulesList}>
              <AppText style={styles.ruleItem}>
                1. The code in the box has "Syntax Errors" (it's written
                incorrectly).
              </AppText>
              <AppText style={styles.ruleItem}>
                2. Your goal is to fix the code so it counts from 1 to 5.
              </AppText>
              <AppText style={styles.ruleItem}>
                3. Use proper JavaScript syntax: 'let', curly brackets {}, and
                semicolons ;
              </AppText>
              <AppText style={styles.ruleItem}>
                4. Tap "Run Code" to test your logic.
              </AppText>
              <AppText style={styles.ruleItem}>
                5. Use the "Hint" if you get stuck!
              </AppText>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowInstructions(false)}
            >
              <AppText style={styles.buttonText}>Enter Puzzle 🚀</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AppText style={styles.title}>Syntax Puzzle 🧩</AppText>
      <AppText style={styles.subtitle}>
        Fix the code syntax so it prints numbers from 1 to 5
      </AppText>

      {/* Code Editor */}
      <View style={styles.editorContainer}>
        <TextInput
          style={styles.codeBox}
          multiline
          value={code}
          onChangeText={setCode}
          textAlignVertical="top"
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={runPuzzle}>
        <AppText style={styles.buttonText}>Run Code ▶️</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ff9800" }]}
        onPress={showHint}
      >
        <AppText style={styles.buttonText}>Show Hint 💡</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#777" }]}
        onPress={resetCode}
      >
        <AppText style={styles.buttonText}>Reset Code 🔄</AppText>
      </TouchableOpacity>

      <AppText style={styles.outputTitle}>Output</AppText>
      <View style={styles.outputBox}>
        <AppText selectable>{output}</AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    paddingTop: 30,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  // --- Modal Styles ---
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
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: Colors.primary,
  },
  rulesList: {
    marginBottom: 20,
  },
  ruleItem: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
    color: "#333",
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  // --- Game Editor Styles ---
  editorContainer: {
    backgroundColor: "#111",
    borderRadius: 12,
  },
  codeBox: {
    color: "#dbddde",
    padding: 15,
    minHeight: 220,
    fontFamily: "monospace",
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  outputTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  outputBox: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
});
