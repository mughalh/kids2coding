import { useRouter } from "expo-router";
import { get, ref, update } from "firebase/database";
import {
  Camera,
  Check,
  Mail,
  MapPin,
  Save,
  User,
  X
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../../src/components/AppText";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/colors";
import { database } from "../../src/firebase/config";
import { useAuth } from "../../src/hooks/useAuth";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    bio?: string;
    location?: string;
  }>({});

  // Load existing profile data
  useEffect(() => {
    if (!user?.uid) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setDisplayName(data.displayName || user.displayName || "");
          setBio(data.bio || "");
          setLocation(data.location || "");
          setAvatar(data.avatar || "");
        } else {
          // Set defaults from auth user
          setDisplayName(user.displayName || "");
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!displayName.trim()) {
      errors.displayName = "Display name is required";
    } else if (displayName.length < 2) {
      errors.displayName = "Display name must be at least 2 characters";
    } else if (displayName.length > 50) {
      errors.displayName = "Display name must be less than 50 characters";
    }

    if (bio && bio.length > 200) {
      errors.bio = "Bio must be less than 200 characters";
    }

    if (location && location.length > 100) {
      errors.location = "Location must be less than 100 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.uid) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const userRef = ref(database, `users/${user.uid}`);

      const updates = {
        displayName: displayName.trim(),
        ...(bio && { bio: bio.trim() }),
        ...(location && { location: location.trim() }),
        ...(avatar && { avatar: avatar.trim() }),
        updatedAt: new Date().toISOString(),
      };

      await update(userRef, updates);

      setSuccess("Profile updated successfully!");

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel with confirmation
  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Stay", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!user) return false;
    return (
      displayName !== (user.displayName || "") ||
      bio !== "" ||
      location !== "" ||
      avatar !== ""
    );
  };

  if (loading || authLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <AppText style={styles.loadingText}>Loading profile...</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Edit Profile</AppText>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.headerButton, saving && styles.disabledButton]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Check size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Success/Error Messages */}
        {success && (
          <View style={styles.successContainer}>
            <Check size={20} color={Colors.success} />
            <AppText style={styles.successText}>{success}</AppText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <X size={20} color={Colors.error} />
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        )}

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>
                {avatar || displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "👤"}
              </AppText>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
          <AppText style={styles.avatarHint}>Tap to change avatar</AppText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <User size={16} color={Colors.primary} />
              <AppText style={styles.label}>Display Name *</AppText>
            </View>
            <TextInput
              style={[styles.input, fieldErrors.displayName && styles.inputError]}
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                if (fieldErrors.displayName) {
                  setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
                }
              }}
              placeholder="Enter your display name"
              placeholderTextColor={Colors.textLight}
              maxLength={50}
            />
            {fieldErrors.displayName && (
              <AppText style={styles.fieldError}>{fieldErrors.displayName}</AppText>
            )}
            <AppText style={styles.hint}>Public name shown to others</AppText>
          </View>

          {/* Email (read-only) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Mail size={16} color={Colors.primary} />
              <AppText style={styles.label}>Email</AppText>
            </View>
            <View style={styles.emailContainer}>
              <AppText style={styles.emailText}>{user?.email}</AppText>
            </View>
            <AppText style={styles.hint}>Email cannot be changed</AppText>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <User size={16} color={Colors.primary} />
              <AppText style={styles.label}>Bio</AppText>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                fieldErrors.bio && styles.inputError,
              ]}
              value={bio}
              onChangeText={(text) => {
                setBio(text);
                if (fieldErrors.bio) {
                  setFieldErrors((prev) => ({ ...prev, bio: undefined }));
                }
              }}
              placeholder="Tell us about yourself"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            {fieldErrors.bio && (
              <AppText style={styles.fieldError}>{fieldErrors.bio}</AppText>
            )}
            <AppText style={styles.hint}>{bio.length}/200 characters</AppText>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MapPin size={16} color={Colors.primary} />
              <AppText style={styles.label}>Location</AppText>
            </View>
            <TextInput
              style={[styles.input, fieldErrors.location && styles.inputError]}
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (fieldErrors.location) {
                  setFieldErrors((prev) => ({ ...prev, location: undefined }));
                }
              }}
              placeholder="Where are you?"
              placeholderTextColor={Colors.textLight}
              maxLength={100}
            />
            {fieldErrors.location && (
              <AppText style={styles.fieldError}>{fieldErrors.location}</AppText>
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" />
              <AppText style={styles.saveButtonText}>Save Changes</AppText>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={saving}
        >
          <AppText style={styles.cancelButtonText}>Cancel</AppText>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.success + "20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  successText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.error + "20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarText: {
    fontSize: 40,
    color: "white",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  avatarHint: {
    fontSize: 12,
    color: Colors.textLight,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Colors.error,
  },
  fieldError: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emailContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  emailText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: 16,
  },
});