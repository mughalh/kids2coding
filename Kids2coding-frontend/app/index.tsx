import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Image, StyleSheet, View, Animated } from "react-native";
import { AppText } from "../src/components/AppText";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 2,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Only redirect after auth state is determined
    const timer = setTimeout(() => {
      if (!loading) {
        // _layout.tsx will handle the navigation based on auth state
        // We just let it take over
        if (isAuthenticated) {
          router.replace("/dashboard");
        } else {
          router.replace("/home");
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <Image
          source={require("../assets/splash.jpg")}
          style={styles.logo}
        />
        <AppText style={styles.title}>Kids 2 Coding 🚀</AppText>
        <AppText style={styles.subtitle}>
          Learn • Play • Code • Create
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 30,
    marginBottom: 25,
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    opacity: 0.8,
    color: Colors.textLight,
  },
});