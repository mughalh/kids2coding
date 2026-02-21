import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth";
import { LogBox, View } from 'react-native';
import { AppText } from "../src/components/AppText";

LogBox.ignoreLogs([
  'Blocked aria-hidden',
  '`aria-hidden`',
]);

export default function Layout() {
  const { user, loading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Track the last auth state we processed to prevent loops
  const lastProcessedAuthRef = useRef<boolean | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Don't navigate while auth is still loading
    if (loading) return;

    // Don't navigate if auth state hasn't changed
    if (lastProcessedAuthRef.current === isAuthenticated) {
      return;
    }

    // Mark that we're processing this auth state
    lastProcessedAuthRef.current = isAuthenticated;

    // Cancel any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Get current route info
    const currentRoute = segments[0] || "index";
    const isDeepLink = segments.length > 1;

    // Not authenticated
    if (!isAuthenticated) {
      // Allow splash, home, and auth routes for unauthenticated users
      const isAllowedRoute = 
        currentRoute === "index" || 
        currentRoute === "home" || 
        currentRoute === "(auth)";

      // Redirect to home if on a protected route
      if (!isAllowedRoute) {
        navigationTimeoutRef.current = setTimeout(() => {
          router.replace("/home");
        }, 50);
      }
      return;
    }

    // Authenticated
    if (isAuthenticated) {
      // Admin redirect
      if (user?.role === "admin" && currentRoute !== "admin") {
        navigationTimeoutRef.current = setTimeout(() => {
          router.replace("/admin");
        }, 50);
        return;
      }

      // Regular user: redirect from splash/login screens to dashboard
      const loginRoutes = ["index", "home"];
      if (loginRoutes.includes(currentRoute) && !isDeepLink) {
        navigationTimeoutRef.current = setTimeout(() => {
          router.replace("/dashboard");
        }, 50);
        return;
      }
    }

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [isAuthenticated, loading]);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
          <AppText>Loading...</AppText>
        </View>
      </>
    );
  }

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