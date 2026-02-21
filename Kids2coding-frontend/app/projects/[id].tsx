import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../src/components/AppText";
import { Colors } from "../../src/constants/colors";
import SpaceInvadersProject from "./space-invaders";
import WeatherAppProject from "./weather-app";
import PortfolioProject from "./portfolio";

// Map numeric IDs to project components
const projectMap = {
  "1": "space-invaders",
  "2": "weather-app",
  "3": "portfolio",
};

const projectComponents = {
  "space-invaders": SpaceInvadersProject,
  "weather-app": WeatherAppProject,
  "portfolio": PortfolioProject,
};

export default function ProjectRouter() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const idString = Array.isArray(id) ? id[0] : id;

  // Determine if it's a numeric ID or string ID
  const isNumericId = /^\d+$/.test(idString);
  
  // Get the component key
  let componentKey = idString;
  if (isNumericId) {
    componentKey = projectMap[idString as keyof typeof projectMap];
  }

  const ProjectComponent = projectComponents[componentKey as keyof typeof projectComponents];

  if (!ProjectComponent) {
    return (
      <View style={styles.center}>
        <AppText style={styles.errorText}>Project not found</AppText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>Go Back</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return <ProjectComponent />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backText: {
    color: "white",
    fontWeight: "600",
  },
});