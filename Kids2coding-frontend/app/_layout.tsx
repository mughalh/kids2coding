import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth";
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Blocked aria-hidden',
  '`aria-hidden`',
]);

export default function Layout() {
  const { user, loading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAtRoot = segments.length === 0 || segments[0] === "index";

    // If not authenticated and not in auth group, go to home
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/");
      return;
    }

    // If authenticated
    if (isAuthenticated) {
      // Admin users go to admin panel
      if (user?.role === "admin") {
        router.replace("/admin");
        return;
      }
      
      // For regular users, only redirect if they're at the root
      // This prevents redirecting when they're trying to go to /games, /courses, etc.
      if (isAtRoot) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, loading, user, segments]);

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}