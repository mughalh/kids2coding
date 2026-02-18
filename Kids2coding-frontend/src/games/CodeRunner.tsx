import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // 1. Added Modal
import { AppText } from "../components/AppText";
import { Colors } from "../constants/colors";

export default function CodeRunner() {
  const [code, setCode] = useState(
    "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
  );
  const [output, setOutput] = useState("");
  const [showRules, setShowRules] = useState(true); // 2. State to control the popup

  const runCode = () => {
    let outputStr = "";
    const originalLog = console.log;

    try {
      console.log = (...args) => {
        outputStr += args.join(" ") + "\n";
      };

      eval(code);
      setOutput(outputStr.trim());
    } catch (err) {
      Alert.alert("Error", err.message);
      setOutput("");
    } finally {
      console.log = originalLog;
    }
  };

  const copyOutput = async () => {
    if (output) {
      await Clipboard.setStringAsync(output);
      Alert.alert("Copied!", "Output has been copied to clipboard.");
    } else {
      Alert.alert("Nothing to copy", "Run the code first!");
    }
  };

  const lineNumbers = code.split("\n").map((_, i) => i + 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 👇 Instructions Modal */}
      <Modal visible={showRules} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>How to Play 💡</AppText>

            <View style={styles.rulesList}>
              <AppText style={styles.ruleItem}>
                1. Write your JavaScript code in the dark editor box.
              </AppText>
              <AppText style={styles.ruleItem}>
                2. Use{" "}
                <AppText style={{ fontWeight: "bold" }}>console.log()</AppText>{" "}
                to see results in the output box.
              </AppText>
              <AppText style={styles.ruleItem}>
                3. Press "Run Code" to execute your logic.
              </AppText>
              <AppText style={styles.ruleItem}>
                4. If there is an error in your code, an alert will tell you
                what's wrong.
              </AppText>
              <AppText style={styles.ruleItem}>
                5. You can copy the output to your clipboard once finished!
              </AppText>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowRules(false)}
            >
              <AppText style={styles.buttonText}>Got it! Let's Go 🚀</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AppText style={styles.title}>Code Runner 🏃</AppText>

      {/* Editor with Line Numbers */}
      <View style={styles.editorContainer}>
        <View style={styles.lineNumbers}>
          {lineNumbers.map((num) => (
            <AppText key={num} style={styles.lineNumberText}>
              {num}
            </AppText>
          ))}
        </View>

        <TextInput
          style={styles.codeBox}
          multiline
          value={code}
          onChangeText={setCode}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={runCode}>
        <AppText style={styles.buttonText}>Run Code ▶️</AppText>
      </TouchableOpacity>

      <AppText style={styles.outputTitle}>Output</AppText>
      <View style={styles.outputBox}>
        <AppText selectable>{output}</AppText>
      </View>

      <TouchableOpacity
        style={[styles.button, { marginTop: 10 }]}
        onPress={copyOutput}
      >
        <AppText style={styles.buttonText}>Copy Output 📋</AppText>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", // Dim background
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
  // --- Code Editor Styles ---
  editorContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
  },
  lineNumbers: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#1c1c1c",
  },
  lineNumberText: {
    color: "#777",
    textAlign: "right",
    fontFamily: "monospace",
    lineHeight: 22,
  },
  codeBox: {
    flex: 1,
    color: "#dbddde",
    padding: 15,
    minHeight: 280,
    fontFamily: "monospace",
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
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
