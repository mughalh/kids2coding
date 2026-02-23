import { useRouter } from "expo-router";
import { Eye, Grid, Heart, Star, Filter, Search } from "lucide-react-native";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";

const { width } = Dimensions.get("window");

export default function ProjectsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const projects = [
    {
      id: "space-invaders",
      title: "Space Invaders Game",
      description: "A retro arcade game built with JavaScript and Canvas. Shoot down aliens and save Earth!",
      author: "Alex Johnson",
      authorAvatar: "👨‍💻",
      likes: 234,
      views: 1250,
      stars: 89,
      category: "games",
      difficulty: "intermediate",
      tags: ["JavaScript", "Canvas", "Games", "Retro"],
      imageUrl: "https://example.com/space-invaders.jpg",
      featured: true,
      demoUrl: "https://spaceinvaders-demo.com",
      githubUrl: "https://github.com/alex/space-invaders",
    },
    {
      id: "weather-app",
      title: "Weather App",
      description: "Real-time weather application with React and OpenWeatherMap API. Get forecasts for any city.",
      author: "Sarah Miller",
      authorAvatar: "👩‍💻",
      likes: 156,
      views: 890,
      stars: 45,
      category: "web",
      difficulty: "beginner",
      tags: ["React", "API", "Weather", "JavaScript"],
      imageUrl: "https://example.com/weather-app.jpg",
      featured: false,
      demoUrl: "https://weatherapp-demo.com",
      githubUrl: "https://github.com/sarah/weather-app",
    },
    {
      id: "portfolio",
      title: "Personal Portfolio",
      description: "Responsive portfolio website with animations, dark mode, and project showcases.",
      author: "Mike Chen",
      authorAvatar: "👨‍🎨",
      likes: 189,
      views: 1100,
      stars: 67,
      category: "web",
      difficulty: "beginner",
      tags: ["HTML", "CSS", "JavaScript", "Responsive"],
      imageUrl: "https://example.com/portfolio.jpg",
      featured: true,
      demoUrl: "https://mike-portfolio.com",
      githubUrl: "https://github.com/mike/portfolio",
    },
  ];

  const filters = [
    { id: "all", label: "All Projects" },
    { id: "featured", label: "Featured" },
    { id: "popular", label: "Popular" },
    { id: "recent", label: "Recent" },
  ];

  const categories = [
    { id: "all", label: "All Categories", emoji: "📚" },
    { id: "web", label: "Web", emoji: "🌐" },
    { id: "mobile", label: "Mobile", emoji: "📱" },
    { id: "games", label: "Games", emoji: "🎮" },
    { id: "ai", label: "AI", emoji: "🤖" },
    { id: "data", label: "Data", emoji: "📊" },
  ];

  const difficulties = {
    beginner: { color: Colors.success, label: "Beginner" },
    intermediate: { color: Colors.warning, label: "Intermediate" },
    advanced: { color: Colors.error, label: "Advanced" },
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      selectedFilter === "all" ||
      (selectedFilter === "featured" && project.featured) ||
      (selectedFilter === "popular" && project.likes > 200);
    
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <AppText style={styles.title}>Student Projects 🏗️</AppText>
            <AppText style={styles.subtitle}>See what other learners are building</AppText>
          </View>
          <View style={styles.viewControls}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === "grid" && styles.viewButtonActive]}
              onPress={() => setViewMode("grid")}
            >
              <Grid size={20} color={viewMode === "grid" ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === "list" && styles.viewButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <AppText style={styles.listIcon}>≡</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filter,
                selectedFilter === filter.id && styles.filterActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <AppText style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}>
                {filter.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.category,
                selectedCategory === category.id && styles.categoryActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <AppText style={styles.categoryEmoji}>{category.emoji}</AppText>
              <AppText style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}>
                {category.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Projects */}
      <ScrollView style={styles.content}>
        {viewMode === "grid" ? (
          <View style={styles.grid}>
            {filteredProjects.map(project => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() => router.push(`/projects/${project.id}`)}
              >
                {/* Project Image */}
                <View style={styles.projectImage}>
                  <View style={styles.imagePlaceholder}>
                    <AppText style={styles.imageEmoji}>
                      {project.id === "space-invaders" ? "👾" : 
                       project.id === "weather-app" ? "☀️" : "📁"}
                    </AppText>
                  </View>
                  {project.featured && (
                    <View style={styles.featuredBadge}>
                      <AppText style={styles.featuredText}>⭐ Featured</AppText>
                    </View>
                  )}
                </View>

                {/* Project Info */}
                <View style={styles.projectInfo}>
                  <AppText style={styles.projectTitle} numberOfLines={1}>
                    {project.title}
                  </AppText>
                  <AppText style={styles.projectDescription} numberOfLines={2}>
                    {project.description}
                  </AppText>

                  {/* Author */}
                  <View style={styles.authorSection}>
                    <View style={styles.authorAvatar}>
                      <AppText style={styles.avatarText}>{project.authorAvatar}</AppText>
                    </View>
                    <AppText style={styles.authorName}>{project.author}</AppText>
                  </View>

                  {/* Tags */}
                  <View style={styles.tags}>
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <AppText style={styles.tagText}>{tag}</AppText>
                      </View>
                    ))}
                  </View>

                  {/* Stats */}
                  <View style={styles.projectFooter}>
                    <View style={styles.stats}>
                      <View style={styles.stat}>
                        <Heart size={14} color={Colors.accent} />
                        <AppText style={styles.statText}>{project.likes}</AppText>
                      </View>
                      <View style={styles.stat}>
                        <Eye size={14} color={Colors.textLight} />
                        <AppText style={styles.statText}>{project.views}</AppText>
                      </View>
                      <View style={styles.stat}>
                        <Star size={14} color={Colors.warning} />
                        <AppText style={styles.statText}>{project.stars}</AppText>
                      </View>
                    </View>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: difficulties[project.difficulty].color + "20" }
                    ]}>
                      <AppText style={[
                        styles.difficultyText,
                        { color: difficulties[project.difficulty].color }
                      ]}>
                        {difficulties[project.difficulty].label}
                      </AppText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredProjects.map(project => (
              <TouchableOpacity
                key={project.id}
                style={styles.listItem}
                onPress={() => router.push(`/projects/${project.id}`)}
              >
                <View style={styles.listImage}>
                  <View style={styles.listImagePlaceholder}>
                    <AppText style={styles.listImageEmoji}>
                      {project.id === "space-invaders" ? "👾" : 
                       project.id === "weather-app" ? "☀️" : "📁"}
                    </AppText>
                  </View>
                </View>
                <View style={styles.listContent}>
                  <View style={styles.listHeader}>
                    <AppText style={styles.listTitle}>{project.title}</AppText>
                    {project.featured && (
                      <View style={styles.listFeatured}>
                        <AppText style={styles.listFeaturedText}>⭐</AppText>
                      </View>
                    )}
                  </View>
                  <AppText style={styles.listDescription} numberOfLines={2}>
                    {project.description}
                  </AppText>
                  <View style={styles.listFooter}>
                    <View style={styles.listAuthor}>
                      <View style={styles.listAvatar}>
                        <AppText style={styles.listAvatarText}>{project.authorAvatar}</AppText>
                      </View>
                      <AppText style={styles.listAuthorName}>{project.author}</AppText>
                    </View>
                    <View style={styles.listStats}>
                      <Heart size={12} color={Colors.accent} />
                      <AppText style={styles.listStatText}>{project.likes}</AppText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton}>
        <AppText style={styles.uploadText}>+ Upload Your Project</AppText>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 5,
  },
  viewControls: {
    flexDirection: "row",
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: Colors.surface,
  },
  listIcon: {
    fontSize: 20,
    color: Colors.textLight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: "100%",
  },
  filterButton: {
    padding: 8,
  },
  filters: {
    marginBottom: 15,
  },
  filter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    marginRight: 10,
  },
  filterActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "white",
  },
  categories: {
    marginBottom: 20,
  },
  category: {
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  categoryTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  projectCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectImage: {
    height: 120,
    backgroundColor: Colors.borderLight,
    position: "relative",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageEmoji: {
    fontSize: 40,
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  projectInfo: {
    padding: 15,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
    marginBottom: 10,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
  },
  authorName: {
    fontSize: 12,
    color: Colors.textLight,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textLight,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.textLight,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  list: {
    gap: 15,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  listImage: {
    marginRight: 15,
  },
  listImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  listImageEmoji: {
    fontSize: 24,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  listFeatured: {
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  listFeaturedText: {
    fontSize: 12,
  },
  listDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  listFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  listAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  listAvatarText: {
    fontSize: 12,
  },
  listAuthorName: {
    fontSize: 12,
    color: Colors.textLight,
  },
  listStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  listStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.textLight,
  },
  uploadButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});