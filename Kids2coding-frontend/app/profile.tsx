import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onValue, ref } from "firebase/database";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Edit3,
  Info,
  Mail,
  MapPin,
  RefreshCw,
  Settings,
  Share2,
  Star,
  Trophy,
  Users
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";
import { database } from "../src/firebase/config";
import { useAuth } from "../src/hooks/useAuth";
import { Home, Gamepad2, Puzzle, Bot, User } from "lucide-react-native";

// Timeout duration for loading (10 seconds)
const LOADING_TIMEOUT = 10000;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);

  // Check authentication on mount
  useEffect(() => {
    console.log("👤 Profile screen mounted");
    console.log("📊 Auth state:", { 
      user: user ? "exists" : "null", 
      authLoading,
      isAuthenticated,
      uid: user?.uid 
    });

    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (loading) {
        setError("Loading timed out. Please check your connection.");
        setLoading(false);
        setDebugInfo(prev => ({
          ...prev,
          timeout: "Loading exceeded 10 seconds",
          timestamp: new Date().toISOString()
        }));
      }
    }, LOADING_TIMEOUT);
    
    setLoadingTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Fetch profile data when user is available
  useEffect(() => {
    // Don't do anything if still loading auth
    if (authLoading) {
      console.log("⏳ Auth still loading...");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log("❌ No authenticated user, redirecting to login");
      setError("You need to be logged in to view your profile");
      setLoading(false);
      if (loadingTimer) clearTimeout(loadingTimer);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.replace("/");
      }, 2000);
      return;
    }

    // Check if user has UID
    if (!user.uid) {
      console.log("❌ User has no UID");
      setError("Invalid user data - missing UID");
      setLoading(false);
      if (loadingTimer) clearTimeout(loadingTimer);
      return;
    }

    console.log(`✅ Fetching profile for user: ${user.uid}`);
    setDebugInfo({
      uid: user.uid,
      email: user.email,
      authStatus: "authenticated",
      timestamp: new Date().toISOString()
    });

    let unsubscribe: (() => void) | undefined;

    try {
      // Create database reference with proper error handling
      const db = database;
      if (!db) {
        throw new Error("Database not initialized");
      }

      const userRef = ref(db, `users/${user.uid}`);
      
      // Use onValue with error handling
      unsubscribe = onValue(userRef, 
        (snapshot) => {
          try {
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log("✅ Profile data found:", data);

              // Calculate level and progress
              const points = data.points || 0;
              const currentLevel = Math.floor(points / 1000) + 1;
              const xpInCurrentLevel = points % 1000;
              const progressToNext = Math.floor((xpInCurrentLevel / 1000) * 100);

              setProfileData({
                ...data,
                level: currentLevel,
                xp: points,
                nextLevelXP: currentLevel * 1000,
                progress: progressToNext,
                avatar: data.displayName?.[0]?.toUpperCase() || user.displayName?.[0]?.toUpperCase() || "👤",
                joined: data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Recently",
              });

              setDebugInfo(prev => ({
                ...prev,
                dataFound: true,
                profileExists: true,
                dataKeys: Object.keys(data)
              }));
            } else {
              console.log("⚠️ No profile data found, using defaults");
              setProfileData(null);
              setDebugInfo(prev => ({
                ...prev,
                dataFound: false,
                profileExists: false,
                message: "No profile document in database"
              }));
            }
          } catch (err: any) {
            console.error("❌ Error processing snapshot:", err);
            setError(err.message || "Error processing profile data");
          } finally {
            setLoading(false);
            if (loadingTimer) clearTimeout(loadingTimer);
          }
        },
        (error) => {
          console.error("❌ Database error:", error);
          setError(error.message || "Failed to load profile");
          setLoading(false);
          if (loadingTimer) clearTimeout(loadingTimer);
        }
      );
    } catch (err: any) {
      console.error("❌ Error setting up listener:", err);
      setError(err.message || "Failed to connect to database");
      setLoading(false);
      if (loadingTimer) clearTimeout(loadingTimer);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.warn("⚠️ Error unsubscribing:", err);
        }
      }
    };
  }, [user, authLoading, isAuthenticated]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    // Force a re-render to trigger useEffect again
    setProfileData(null);
  }, []);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    handleRefresh();
  }, []);

  // Show loading state
  if (authLoading || loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <AppText style={styles.loadingText}>
            {authLoading ? "Checking authentication..." : "Loading your profile..."}
          </AppText>
          <AppText style={styles.loadingSubtext}>
            This may take a few seconds
          </AppText>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <AppText style={styles.cancelButtonText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <AlertCircle size={60} color={Colors.error} />
          <AppText style={styles.errorTitle}>Oops!</AppText>
          <AppText style={styles.errorMessage}>{error}</AppText>
          
          <View style={styles.errorActions}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <RefreshCw size={20} color="white" />
              <AppText style={styles.retryButtonText}>Retry</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => setShowDebugModal(true)}
            >
              <Info size={20} color={Colors.primary} />
              <AppText style={styles.debugButtonText}>Debug Info</AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <AppText style={styles.backLinkText}>← Back to Dashboard</AppText>
          </TouchableOpacity>
        </View>

        {/* Debug Modal */}
        <Modal
          visible={showDebugModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDebugModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle}>Debug Information</AppText>
                <TouchableOpacity onPress={() => setShowDebugModal(false)}>
                  <AppText style={styles.modalClose}>✕</AppText>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.debugSection}>
                  <AppText style={styles.debugLabel}>User Info:</AppText>
                  <AppText style={styles.debugText}>
                    UID: {user?.uid || 'N/A'}{'\n'}
                    Email: {user?.email || 'N/A'}{'\n'}
                    Display Name: {user?.displayName || 'N/A'}{'\n'}
                    Auth Status: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
                  </AppText>
                </View>

                <View style={styles.debugSection}>
                  <AppText style={styles.debugLabel}>Error Details:</AppText>
                  <AppText style={styles.debugText}>
                    {error || 'No error'}
                  </AppText>
                </View>

                <View style={styles.debugSection}>
                  <AppText style={styles.debugLabel}>Debug Info:</AppText>
                  <AppText style={styles.debugText}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </AppText>
                </View>

                <View style={styles.debugSection}>
                  <AppText style={styles.debugLabel}>Troubleshooting Tips:</AppText>
                  <AppText style={styles.debugText}>
                    1. Check if user exists in Firebase Auth{'\n'}
                    2. Verify database rules allow reading users/{user?.uid}{'\n'}
                    3. Check if 'users' node has data for this UID{'\n'}
                    4. Ensure database URL is correct in config{'\n'}
                    5. Try logging out and back in
                  </AppText>
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowDebugModal(false)}
              >
                <AppText style={styles.modalButtonText}>Close</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScreenWrapper>
    );
  }

  // Fallback if no data found
  const displayUser = profileData || {
    displayName: user?.displayName || user?.email?.split('@')[0] || "Coder Kid",
    email: user?.email || "No email",
    bio: "Learning to code and building awesome things!",
    location: "Digital World",
    streak: 0,
    points: 0,
    completedLessons: {},
    badges: [],
    level: 1,
    xp: 0,
    progress: 0,
    avatar: user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "👤",
    joined: "Recently"
  };

  return (
    <ScreenWrapper>
      
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <AppText style={styles.backText}>← Back</AppText>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerAction}>
                <Share2 size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerAction}
                onPress={() => setShowDebugModal(true)}
              >
                <Info size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <AppText style={styles.avatarText}>
                  {displayUser.avatar}
                </AppText>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/profile/edit")}
              >
                <Edit3 size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <AppText style={styles.userName}>
                {displayUser.displayName}
              </AppText>
              <AppText style={styles.userUsername}>
                @{displayUser.displayName?.toLowerCase().replace(/\s/g, "")}
              </AppText>
              <AppText style={styles.userBio}>
                {displayUser.bio}
              </AppText>
            </View>

            <View style={styles.userMeta}>
              <View style={styles.metaItem}>
                <Calendar size={14} color="rgba(255,255,255,0.8)" />
                <AppText style={styles.metaText}>
                  Joined {displayUser.joined}
                </AppText>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={14} color="rgba(255,255,255,0.8)" />
                <AppText style={styles.metaText}>
                  {displayUser.location}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Trophy size={20} color={Colors.warning} />
              <AppText style={styles.levelNumber}>
                Level {displayUser.level}
              </AppText>
            </View>
            <AppText style={styles.levelXP}>{displayUser.xp} XP</AppText>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${displayUser.progress}%` },
              ]}
            />
          </View>
          <AppText style={styles.progressText}>
            {displayUser.progress}% to level {displayUser.level + 1}
          </AppText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <BookOpen size={24} color={Colors.primary} />
            <AppText style={styles.statValue}>
              {displayUser.completedLessons
                ? Object.keys(displayUser.completedLessons).length
                : 0}
            </AppText>
            <AppText style={styles.statLabel}>Lessons</AppText>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color={Colors.warning} />
            <AppText style={styles.statValue}>
              {displayUser.points}
            </AppText>
            <AppText style={styles.statLabel}>Points</AppText>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color={Colors.accent} />
            <AppText style={styles.statValue}>
              {displayUser.badges?.length || 0}
            </AppText>
            <AppText style={styles.statLabel}>Badges</AppText>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color={Colors.success} />
            <AppText style={styles.statValue}>
              {displayUser.streak || 0}
            </AppText>
            <AppText style={styles.statLabel}>Day Streak</AppText>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Mail size={20} color={Colors.primary} />
            <AppText style={styles.contactTitle}>Contact Information</AppText>
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Mail size={16} color={Colors.textLight} />
              <AppText style={styles.contactText}>{displayUser.email}</AppText>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/settings")}
          >
            <Settings size={20} color={Colors.primary} />
            <AppText style={styles.quickActionText}>Settings</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={20} color={Colors.primary} />
            <AppText style={styles.quickActionText}>Refresh</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textLight,
  },
  cancelButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 20,
  },
  backLinkText: {
    color: Colors.primary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.textLight,
  },
  modalBody: {
    padding: 20,
  },
  debugSection: {
    marginBottom: 20,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 40,
    color: Colors.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userUsername: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  levelCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  levelXP: {
    fontSize: 14,
    color: Colors.textLight,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  contactInfo: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
});