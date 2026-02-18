import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { AppButton } from "../src/components/AppButton";
import { AppText } from "../src/components/AppText";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth"; // 👈 Use the hook

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const cardWidth = width > 768 ? 450 : width * 0.9;

  // -------- USE AUTH HOOK --------
  const { login, signup, resetPassword, loading: authLoading, isAuthenticated } = useAuth();

  // -------- STATE --------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // -------- ANIMATION --------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setMessage({ text: "", type: "" });
  }, [isLoginMode, isResetMode]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !submitting) {
      console.log("✅ User authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, submitting]);

  // -------- HANDLERS USING SDK --------
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setMessage({ text: "Enter email and password", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        // Navigation will happen via the useEffect above
      } else {
        setMessage({ text: result.error || "Login failed", type: "error" });
        setSubmitting(false);
      }
    } catch (error: any) {
      setMessage({ text: error.message || "Login failed", type: "error" });
      setSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!email.trim() || !displayName.trim() || !password) {
      setMessage({ text: "Fill all fields", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const result = await signup(email.trim(), password, displayName.trim());
      
      if (result.success) {
        setMessage({
          text: "Account created! Logging you in...",
          type: "success",
        });
        // User will be automatically logged in and redirected
      } else {
        setMessage({ text: result.error || "Signup failed", type: "error" });
        setSubmitting(false);
      }
    } catch (error: any) {
      setMessage({ text: error.message || "Signup failed", type: "error" });
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setMessage({ text: "Please enter your email", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        setMessage({
          text: "Reset link sent! Check your inbox 📧",
          type: "success",
        });
        setTimeout(() => setIsResetMode(false), 3000);
      } else {
        setMessage({ text: result.error || "Failed to send reset link", type: "error" });
      }
      setSubmitting(false);
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to send reset link", type: "error" });
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/splash.jpg")}
        style={[styles.bg, { width, height }]}
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <Animated.View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <AppText style={styles.title}>Kids 2 Coding</AppText>
              <AppText style={styles.subTitle}>
                {isResetMode
                  ? "Recover your account 🔑"
                  : "Unlock your inner genius 🤖"}
              </AppText>

              {!isResetMode && (
                <View style={styles.tabs}>
                  {["Login", "Join"].map((t, i) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.tab,
                        isLoginMode === (i === 0) && styles.activeTab,
                      ]}
                      onPress={() => setIsLoginMode(i === 0)}
                    >
                      <AppText style={{ color: "#fff" }}>{t}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {message.text !== "" && (
                <View
                  style={[
                    styles.msg,
                    message.type === "error" ? styles.error : styles.success,
                  ]}
                >
                  <AppText style={{ color: "#fff", textAlign: "center" }}>
                    {message.text}
                  </AppText>
                </View>
              )}

              {!isLoginMode && !isResetMode && (
                <TextInput
                  placeholder="Display Name"
                  placeholderTextColor="#ddd"
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              )}

              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#ddd"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {!isResetMode && (
                <>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  {isLoginMode && (
                    <TouchableOpacity
                      onPress={() => setIsResetMode(true)}
                      style={styles.forgotPassContainer}
                    >
                      <AppText style={styles.forgotPassText}>
                        Forgot Password?
                      </AppText>
                    </TouchableOpacity>
                  )}
                  {!isLoginMode && (
                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor="#ddd"
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  )}
                </>
              )}

              <AppButton
                title={
                  submitting
                    ? ""
                    : isResetMode
                      ? "Send Reset Link"
                      : isLoginMode
                        ? "Sign In"
                        : "Create Account"
                }
                onPress={
                  isResetMode
                    ? handleResetPassword
                    : isLoginMode
                      ? handleLogin
                      : handleSignup
                }
                disabled={submitting}
                style={styles.btn}
              >
                {submitting && <ActivityIndicator color="#fff" />}
              </AppButton>

              {isResetMode && (
                <TouchableOpacity
                  onPress={() => setIsResetMode(false)}
                  style={{ marginTop: 20, alignItems: "center" }}
                >
                  <AppText style={styles.forgotPassText}>Back to Login</AppText>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { justifyContent: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 25,
    borderRadius: 30,
  },
  title: { fontSize: 32, color: "#fff", fontWeight: "800" },
  subTitle: { color: "#ddd", marginBottom: 20 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    marginBottom: 15,
  },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  activeTab: { backgroundColor: Colors.primary, borderRadius: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginBottom: 10,
  },
  btn: { marginTop: 10 },
  msg: { padding: 12, borderRadius: 10, marginBottom: 15 },
  error: { backgroundColor: "rgba(255,50,50,0.4)" },
  success: { backgroundColor: "rgba(50,255,50,0.3)" },
  forgotPassContainer: {
    alignSelf: "flex-end",
    marginBottom: 15,
    paddingRight: 5,
  },
  forgotPassText: {
    color: "#ddd",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});