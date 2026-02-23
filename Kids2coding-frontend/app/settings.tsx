import { useRouter } from "expo-router";
import {
    ChevronRight,
    HelpCircle,
    LogOut,
    Palette,
    Settings as SettingsIcon,
    Shield,
    User
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    soundEffects: true,
    autoDownload: false,
    learningReminders: true,
    weeklyReports: true,
    privacyProfile: false,
    dataSaver: false,
  });

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              // Call Firebase signOut() and clear local auth state
              await logout();
              // Clear AsyncStorage
              await AsyncStorage.clear();
              // Navigation will be handled by _layout.tsx when isAuthenticated becomes false
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsGroups = [
    {
      title: "Account",
      icon: User,
      items: [
        {
          icon: "👤",
          title: "Edit Profile",
          description: "Update your personal information",
          onPress: () => router.push("/profile/edit"),
          type: "navigation" as const,
        },
        {
          icon: "🔐",
          title: "Change Password",
          description: "Update your login password",
          onPress: () => router.push("/settings/password"),
          type: "navigation" as const,
        },
        {
          icon: "📧",
          title: "Email Settings",
          description: "Manage email preferences",
          onPress: () => router.push("/settings/email"),
          type: "navigation" as const,
        },
      ],
    },
    {
      title: "Preferences",
      icon: Palette,
      items: [
        {
          icon: "🌙",
          title: "Dark Mode",
          description: "Toggle dark theme",
          value: settings.darkMode,
          onToggle: () => handleToggle("darkMode"),
          type: "toggle" as const,
        },
        {
          icon: "🔔",
          title: "Notifications",
          description: "Enable push notifications",
          value: settings.notifications,
          onToggle: () => handleToggle("notifications"),
          type: "toggle" as const,
        },
        {
          icon: "🔊",
          title: "Sound Effects",
          description: "Play sounds for interactions",
          value: settings.soundEffects,
          onToggle: () => handleToggle("soundEffects"),
          type: "toggle" as const,
        },
        {
          icon: "💾",
          title: "Auto Download",
          description: "Automatically download lessons",
          value: settings.autoDownload,
          onToggle: () => handleToggle("autoDownload"),
          type: "toggle" as const,
        },
      ],
    },
    {
      title: "Learning",
      icon: SettingsIcon,
      items: [
        {
          icon: "⏰",
          title: "Learning Reminders",
          description: "Daily reminders to learn",
          value: settings.learningReminders,
          onToggle: () => handleToggle("learningReminders"),
          type: "toggle" as const,
        },
        {
          icon: "📊",
          title: "Weekly Reports",
          description: "Receive weekly progress reports",
          value: settings.weeklyReports,
          onToggle: () => handleToggle("weeklyReports"),
          type: "toggle" as const,
        },
        {
          icon: "🌍",
          title: "Language",
          description: "App language: English",
          onPress: () => router.push("/settings/language"),
          type: "navigation" as const,
        },
        {
          icon: "📏",
          title: "Difficulty Level",
          description: "Current: Adaptive",
          onPress: () => router.push("/settings/difficulty"),
          type: "navigation" as const,
        },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        {
          icon: "👁️",
          title: "Profile Privacy",
          description: "Control who sees your profile",
          value: settings.privacyProfile,
          onToggle: () => handleToggle("privacyProfile"),
          type: "toggle" as const,
        },
        {
          icon: "💾",
          title: "Data Saver",
          description: "Reduce data usage",
          value: settings.dataSaver,
          onToggle: () => handleToggle("dataSaver"),
          type: "toggle" as const,
        },
        {
          icon: "🗑️",
          title: "Clear Cache",
          description: "Free up storage space",
          onPress: () => {
            Alert.alert(
              "Clear Cache",
              "This will remove all temporary data. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Clear", 
                  style: "destructive",
                  onPress: () => {
                    // Handle clear cache
                    Alert.alert("Success", "Cache cleared successfully!");
                  }
                }
              ]
            );
          },
          type: "action" as const,
        },
      ],
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        {
          icon: "❓",
          title: "Help Center",
          description: "Get help and FAQs",
          onPress: () => router.push("/help"),
          type: "navigation" as const,
        },
        {
          icon: "📱",
          title: "About App",
          description: "Version 1.2.0",
          onPress: () => router.push("/about"),
          type: "navigation" as const,
        },
        {
          icon: "⭐",
          title: "Rate App",
          description: "Love the app? Rate us!",
          onPress: () => {
            // Handle app store rating
            Alert.alert("Rate App", "Would you like to rate Kids 2 Coding?", [
              { text: "Maybe Later", style: "cancel" },
              { text: "Rate Now", onPress: () => {/* Open app store */} }
            ]);
          },
          type: "action" as const,
        },
        {
          icon: "📧",
          title: "Contact Support",
          description: "Get in touch with us",
          onPress: () => router.push("/contact"),
          type: "navigation" as const,
        },
      ],
    },
  ];

  const SettingItem = ({ item }: { item: any }) => {
    const IconComponent = item.icon.length === 1 ? 
      () => <AppText style={styles.itemIcon}>{item.icon}</AppText> :
      () => <AppText style={styles.itemIcon}>{item.icon}</AppText>;

    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={item.type === "toggle" ? item.onToggle : item.onPress}
        disabled={item.type === "toggle"}
      >
        <View style={styles.itemLeft}>
          <IconComponent />
          <View style={styles.itemContent}>
            <AppText style={styles.itemTitle}>{item.title}</AppText>
            <AppText style={styles.itemDescription}>{item.description}</AppText>
          </View>
        </View>

        <View style={styles.itemRight}>
          {item.type === "toggle" ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="white"
              ios_backgroundColor={Colors.border}
            />
          ) : item.type === "navigation" ? (
            <ChevronRight size={20} color={Colors.textLight} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper scrollable>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <SettingsIcon size={32} color={Colors.primary} />
          <AppText style={styles.title}>Settings ⚙️</AppText>
          <AppText style={styles.subtitle}>Customize your learning experience</AppText>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Account Info */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>😎</AppText>
            </View>
            <View style={styles.accountInfo}>
              <AppText style={styles.accountName}>Code Learner</AppText>
              <AppText style={styles.accountEmail}>learner@kids2coding.com</AppText>
              <AppText style={styles.accountStatus}>
                Premium Member • Level 6
              </AppText>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push("/premium")}
          >
            <AppText style={styles.upgradeText}>✨ Upgrade to Premium</AppText>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <View style={styles.groupHeader}>
              <group.icon size={20} color={Colors.primary} />
              <AppText style={styles.groupTitle}>{group.title}</AppText>
            </View>
            <View style={styles.groupContent}>
              {group.items.map((item, itemIndex) => (
                <SettingItem key={itemIndex} item={item} />
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <AppText style={styles.dangerTitle}>Danger Zone</AppText>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Delete Account",
                "This will permanently delete your account and all data. This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Delete Account", 
                    style: "destructive",
                    onPress: () => {
                      Alert.alert(
                        "Confirm Deletion",
                        "Please enter your password to confirm account deletion.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive" }
                        ]
                      );
                    }
                  }
                ]
              );
            }}
          >
            <AppText style={styles.deleteText}>🗑️ Delete Account</AppText>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.error} />
          <AppText style={styles.logoutText}>Log Out</AppText>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <AppText style={styles.appInfoText}>
            Kids 2 Coding v1.2.0
          </AppText>
          <AppText style={styles.appInfoText}>
            © 2024 Kids 2 Coding. All rights reserved.
          </AppText>
          <TouchableOpacity>
            <AppText style={styles.privacyLink}>Privacy Policy</AppText>
          </TouchableOpacity>
          <TouchableOpacity>
            <AppText style={styles.termsLink}>Terms of Service</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 5,
    textAlign: "center",
  },
  accountCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 28,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  accountStatus: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  upgradeButton: {
    backgroundColor: Colors.warning + "20",
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.warning,
  },
  settingsGroup: {
    marginBottom: 30,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 10,
  },
  groupContent: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 40,
    textAlign: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  itemRight: {
    marginLeft: 10,
  },
  dangerZone: {
    backgroundColor: Colors.error + "10",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.error,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  deleteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.error,
    marginLeft: 10,
  },
  appInfo: {
    alignItems: "center",
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 5,
    textAlign: "center",
  },
  privacyLink: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 10,
  },
  termsLink: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 5,
  },
});