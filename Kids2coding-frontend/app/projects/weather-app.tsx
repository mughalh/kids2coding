import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { Heart, Eye, Star, Github, ExternalLink, Search, Cloud, Sun, Wind, Droplets } from "lucide-react-native";

export default function WeatherAppProject() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<null | {
    city: string;
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  }>(null);

  const searchWeather = () => {
    if (!city.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const icons = { Sunny: "☀️", Cloudy: "☁️", Rainy: "🌧️", "Partly Cloudy": "⛅" };
      
      setWeather({
        city: city,
        temp: Math.floor(Math.random() * 30) + 5,
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 50) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        icon: icons[randomCondition as keyof typeof icons],
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>← Back to Projects</AppText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.titleSection}>
            <AppText style={styles.emoji}>☀️</AppText>
            <View>
              <AppText style={styles.title}>Weather App</AppText>
              <AppText style={styles.author}>by Sarah Miller</AppText>
            </View>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Heart size={16} color={Colors.accent} />
              <AppText style={styles.statText}>156</AppText>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color={Colors.textLight} />
              <AppText style={styles.statText}>890</AppText>
            </View>
            <View style={styles.statItem}>
              <Star size={16} color={Colors.warning} />
              <AppText style={styles.statText}>45</AppText>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {/* Open demo */}}>
            <ExternalLink size={16} color="white" />
            <AppText style={styles.actionText}>Live Demo</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.githubButton]} onPress={() => {/* Open GitHub */}}>
            <Github size={16} color="white" />
            <AppText style={styles.actionText}>GitHub</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <AppText style={styles.demoTitle}>Live Demo</AppText>
          <View style={styles.weatherCard}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter city name..."
                value={city}
                onChangeText={setCity}
                placeholderTextColor={Colors.textLight}
              />
              <TouchableOpacity style={styles.searchButton} onPress={searchWeather}>
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <AppText style={styles.loadingText}>Fetching weather...</AppText>
              </View>
            )}

            {weather && !loading && (
              <View style={styles.weatherInfo}>
                <AppText style={styles.cityName}>{weather.city}</AppText>
                <View style={styles.tempContainer}>
                  <AppText style={styles.weatherIcon}>{weather.icon}</AppText>
                  <AppText style={styles.temperature}>{weather.temp}°C</AppText>
                </View>
                <AppText style={styles.condition}>{weather.condition}</AppText>
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Droplets size={20} color={Colors.primary} />
                    <AppText style={styles.detailLabel}>Humidity</AppText>
                    <AppText style={styles.detailValue}>{weather.humidity}%</AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <Wind size={20} color={Colors.primary} />
                    <AppText style={styles.detailLabel}>Wind Speed</AppText>
                    <AppText style={styles.detailValue}>{weather.windSpeed} km/h</AppText>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>About this project</AppText>
          <AppText style={styles.description}>
            A real-time weather application that provides current weather conditions 
            for any city worldwide. Built with React and the OpenWeatherMap API.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Technologies Used</AppText>
          <View style={styles.techTags}>
            {["React", "OpenWeatherMap API", "Axios", "CSS Modules"].map((tech, index) => (
              <View key={index} style={styles.techTag}>
                <AppText style={styles.techText}>{tech}</AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Features</AppText>
          <View style={styles.featuresList}>
            {[
              "Real-time weather data",
              "Search by city name",
              "Temperature in Celsius/Fahrenheit",
              "Humidity and wind speed",
              "Weather condition icons",
              "Responsive design",
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <AppText style={styles.featureBullet}>•</AppText>
                <AppText style={styles.featureText}>{feature}</AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  author: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stats: {
    flexDirection: "row",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  githubButton: {
    backgroundColor: "#333",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  demoSection: {
    marginBottom: 30,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  weatherCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  weatherInfo: {
    alignItems: "center",
  },
  cityName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 10,
  },
  weatherIcon: {
    fontSize: 48,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
  },
  condition: {
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    paddingVertical: 15,
    borderRadius: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginVertical: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  techTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  techTag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  techText: {
    fontSize: 12,
    color: Colors.text,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureBullet: {
    fontSize: 16,
    color: Colors.primary,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});