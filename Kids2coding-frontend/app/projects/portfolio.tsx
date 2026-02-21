import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { Heart, Eye, Star, Github, ExternalLink, Moon, Sun } from "lucide-react-native";

export default function PortfolioProject() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backText}>← Back to Projects</AppText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.titleSection}>
            <AppText style={styles.emoji}>📁</AppText>
            <View>
              <AppText style={styles.title}>Personal Portfolio</AppText>
              <AppText style={styles.author}>by Mike Chen</AppText>
            </View>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Heart size={16} color={Colors.accent} />
              <AppText style={styles.statText}>189</AppText>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color={Colors.textLight} />
              <AppText style={styles.statText}>1.1k</AppText>
            </View>
            <View style={styles.statItem}>
              <Star size={16} color={Colors.warning} />
              <AppText style={styles.statText}>67</AppText>
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
          <View style={styles.demoHeader}>
            <AppText style={styles.demoTitle}>Preview</AppText>
            <TouchableOpacity 
              style={styles.themeToggle} 
              onPress={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun size={20} color={Colors.warning} />
              ) : (
                <Moon size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.previewCard, darkMode && styles.previewCardDark]}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar}>
                <AppText style={styles.previewAvatarText}>👨‍🎨</AppText>
              </View>
              <View>
                <AppText style={[styles.previewName, darkMode && styles.textLight]}>Mike Chen</AppText>
                <AppText style={[styles.previewTitle, darkMode && styles.textLight]}>Frontend Developer</AppText>
              </View>
            </View>

            <View style={styles.previewSkills}>
              {["React", "JavaScript", "CSS", "Node.js"].map((skill, index) => (
                <View key={index} style={[styles.previewSkill, darkMode && styles.skillDark]}>
                  <AppText style={[styles.previewSkillText, darkMode && styles.textLight]}>{skill}</AppText>
                </View>
              ))}
            </View>

            <View style={styles.previewProjects}>
              <AppText style={[styles.previewProjectsTitle, darkMode && styles.textLight]}>Recent Projects</AppText>
              <View style={styles.previewProjectItem}>
                <AppText style={[styles.previewProjectDot, darkMode && styles.dotLight]}>•</AppText>
                <AppText style={[styles.previewProjectText, darkMode && styles.textLight]}>E-commerce Dashboard</AppText>
              </View>
              <View style={styles.previewProjectItem}>
                <AppText style={[styles.previewProjectDot, darkMode && styles.dotLight]}>•</AppText>
                <AppText style={[styles.previewProjectText, darkMode && styles.textLight]}>Weather App</AppText>
              </View>
              <View style={styles.previewProjectItem}>
                <AppText style={[styles.previewProjectDot, darkMode && styles.dotLight]}>•</AppText>
                <AppText style={[styles.previewProjectText, darkMode && styles.textLight]}>Task Manager</AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>About this project</AppText>
          <AppText style={styles.description}>
            A modern, responsive portfolio website showcasing my projects and skills. 
            Features a clean design, smooth animations, and a dark mode toggle.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Technologies Used</AppText>
          <View style={styles.techTags}>
            {["React", "Next.js", "Tailwind CSS", "Framer Motion"].map((tech, index) => (
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
              "Responsive design",
              "Dark/light mode toggle",
              "Smooth animations",
              "Project showcase",
              "Contact form",
              "Blog section",
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
  demoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  themeToggle: {
    padding: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  previewCardDark: {
    backgroundColor: "#1a1a1a",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  previewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  previewAvatarText: {
    fontSize: 30,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  previewTitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  previewSkills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  previewSkill: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillDark: {
    backgroundColor: "#333",
  },
  previewSkillText: {
    fontSize: 12,
    color: Colors.text,
  },
  previewProjects: {
    gap: 8,
  },
  previewProjectsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  previewProjectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewProjectDot: {
    fontSize: 14,
    color: Colors.primary,
  },
  dotLight: {
    color: "#888",
  },
  previewProjectText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  textLight: {
    color: "#fff",
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