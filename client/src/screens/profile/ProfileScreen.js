import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";

import DateField from "../../components/common/DateField";
import ScreenShell from "../../components/common/ScreenShell";
import { updateMyProfile } from "../../services/authService";
import { useAppTheme } from "../../styles/theme";
import { formatDateToEuropean } from "../../utils/date";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  bio: "",
  birthDate: "",
  avatarUrl: "",
  avatarPreview: "",
  removeAvatar: false
};

export default function ProfileScreen({
  isGuest,
  token,
  profile,
  onLogout,
  onLoginPress,
  onRegisterPress,
  onProfileUpdated
}) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const avatarUrl = profile?.profile?.avatarUrl || "";

  const currentProfileValues = useMemo(
    () => ({
      firstName: profile?.profile?.firstName || "",
      lastName: profile?.profile?.lastName || "",
      bio: profile?.profile?.bio || "",
      birthDate: profile?.profile?.birthDate
        ? String(profile.profile.birthDate).slice(0, 10)
        : "",
      avatarUrl: profile?.profile?.avatarUrl || "",
      avatarPreview: profile?.profile?.avatarUrl || "",
      removeAvatar: false
    }),
    [profile]
  );

  useEffect(() => {
    setForm(currentProfileValues);
  }, [currentProfileValues]);

  function openEditModal() {
    setForm(currentProfileValues);
    setError("");
    setEditVisible(true);
  }

  function closeEditModal() {
    if (saving) {
      return;
    }

    setEditVisible(false);
    setError("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handlePickAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu galería para poder seleccionar una imagen de perfil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.45,
        base64: true
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || "image/jpeg";

      setForm((current) => ({
        ...current,
        avatarPreview: asset.uri,
        avatarUrl: asset.base64 ? `data:${mimeType};base64,${asset.base64}` : current.avatarUrl,
        removeAvatar: false
      }));
    } catch (_error) {
      Alert.alert("No se pudo abrir la galería", "Inténtalo de nuevo desde tu dispositivo.");
    }
  }

  function handleRemoveAvatar() {
    setForm((current) => ({
      ...current,
      avatarPreview: "",
      avatarUrl: "",
      removeAvatar: true
    }));
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setError("");

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        birthDate: form.birthDate,
        avatarUrl: form.removeAvatar ? null : form.avatarUrl || undefined,
        removeAvatar: form.removeAvatar
      };

      const response = await updateMyProfile(token, payload);
      onProfileUpdated?.(response.data);
      setEditVisible(false);
    } catch (requestError) {
      setError(requestError.message || "No se ha podido actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (isGuest) {
    return (
      <ScreenShell>
        <View style={styles.guestCard}>
          <Text style={styles.title}>Perfil bloqueado para invitados</Text>
          <Text style={styles.subtitle}>
            Inicia sesión o regístrate para  consultar y editar tus datos personales, guardar tus
            recetas y gestionar tu actividad dentro de la aplicación.
          </Text>
          <View style={styles.guestButtons}>
            <Pressable style={styles.guestPrimaryButton} onPress={onLoginPress}>
              <Ionicons name="log-in-outline" size={18} color={theme.colors.white} />
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
            </Pressable>
            <Pressable style={styles.secondaryButtonGuest} onPress={onRegisterPress}>
              <Ionicons name="person-add-outline" size={18} color={theme.colors.primaryStrong} />
              <Text style={styles.secondaryButtonText}>Registrarse</Text>
            </Pressable>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Perfil</Text>
        <Text style={styles.title}>Tus datos personales</Text>
        <Text style={styles.subtitle}>
          Consulta tu información básica.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarSection}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(profile?.username || "U").slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarTitle}>Foto de perfil</Text>
            <Text style={styles.avatarSubtitle}>
              {avatarUrl
                ? "Tu imagen de perfil actual."
                : "Todavía no has añadido una imagen de perfil."}
            </Text>
          </View>
        </View>

        <InfoRow label="Nombre de usuario" value={profile?.username || "Sin definir"} styles={styles} />
        <InfoRow label="Nombre" value={profile?.profile?.firstName || "Sin definir"} styles={styles} />
        <InfoRow
          label="Apellidos"
          value={profile?.profile?.lastName || "Sin definir"}
          styles={styles}
        />
        <InfoRow label="Biografía" value={profile?.profile?.bio || "Sin definir"} multiline styles={styles} />
        <InfoRow
          label="Fecha de nacimiento"
          value={
            profile?.profile?.birthDate
              ? formatDateToEuropean(String(profile.profile.birthDate).slice(0, 10))
              : "Sin definir"
          }
          styles={styles}
        />

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={18} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>Editar perfil</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onLogout}>
            <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>

      <EditProfileModal
        visible={editVisible}
        form={form}
        onChangeField={updateField}
        onClose={closeEditModal}
        onSave={handleSaveProfile}
        onPickAvatar={handlePickAvatar}
        onRemoveAvatar={handleRemoveAvatar}
        saving={saving}
        error={error}
        theme={theme}
      />
    </ScreenShell>
  );
}

function EditProfileModal({
  visible,
  form,
  onChangeField,
  onClose,
  onSave,
  onPickAvatar,
  onRemoveAvatar,
  saving,
  error,
  theme
}) {
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalWrap}>
          <KeyboardAwareScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalCard}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={24}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-outline" size={22} color={theme.colors.text} />
              </Pressable>
            </View>


            <View style={styles.imageManager}>
              {form.avatarPreview ? (
                <Image source={{ uri: form.avatarPreview }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color={theme.colors.primaryStrong} />
                  <Text style={styles.imagePlaceholderText}>Sin imagen de perfil</Text>
                </View>
              )}

              <View style={styles.imageActions}>
                <Pressable style={styles.secondaryButtonInline} onPress={onPickAvatar}>
                  <Text style={styles.secondaryButtonText}>
                    {form.avatarPreview ? "Cambiar imagen" : "Añadir imagen"}
                  </Text>
                </Pressable>
                {form.avatarPreview ? (
                  <Pressable style={styles.deleteButtonInline} onPress={onRemoveAvatar}>
                    <Text style={styles.deleteButtonText}>Quitar imagen</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <TextInput
              value={form.firstName}
              onChangeText={(value) => onChangeField("firstName", value)}
              placeholder="Nombre"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <TextInput
              value={form.lastName}
              onChangeText={(value) => onChangeField("lastName", value)}
              placeholder="Apellidos"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <TextInput
              value={form.bio}
              onChangeText={(value) => onChangeField("bio", value)}
              placeholder="Biografía"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.textArea]}
              multiline
            />

            <DateField
              label="Fecha de nacimiento"
              value={form.birthDate}
              onChange={(value) => onChangeField("birthDate", value)}
              placeholder="Selecciona tu fecha de nacimiento"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButtonWide} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButtonWide, saving && styles.buttonDisabled]}
                onPress={onSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value, multiline = false, styles }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>{value}</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    hero: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    eyebrow: {
      color: theme.colors.accentStrong,
      textTransform: "uppercase",
      letterSpacing: 1.8,
      fontWeight: "800",
      fontSize: 12
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "900",
      marginTop: 10
    },
    subtitle: {
      color: theme.colors.textSoft,
      marginTop: 10,
      lineHeight: 22
    },
    card: {
      marginTop: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    avatarSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 14,
      marginBottom: 14
    },
    avatarImage: {
      width: 64,
      height: 64,
      borderRadius: 22
    },
    avatarPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor: theme.colors.primarySoft,
      alignItems: "center",
      justifyContent: "center"
    },
    avatarInitial: {
      color: theme.colors.primaryStrong,
      fontWeight: "900",
      fontSize: 26
    },
    avatarInfo: {
      flex: 1
    },
    avatarTitle: {
      color: theme.colors.text,
      fontWeight: "800",
      fontSize: 16
    },
    avatarSubtitle: {
      color: theme.colors.textSoft,
      marginTop: 4,
      lineHeight: 20
    },
    infoRow: {
      marginBottom: 12
    },
    infoLabel: {
      marginBottom: 8,
      color: theme.colors.textSoft,
      fontSize: 13,
      fontWeight: "700"
    },
    infoValue: {
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text
    },
    infoValueMultiline: {
      lineHeight: 22
    },
    actionsRow: {
      marginTop: 8,
      gap: 10
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    secondaryButton: {
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: "center"
    },
    secondaryButtonGuest: {
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
      borderRadius: 20,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    secondaryButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    guestCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 30,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    guestButtons: {
      gap: 12,
      marginTop: 20
    },
    guestPrimaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 12,
      ...theme.shadow
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: 18
    },
    modalWrap: {
      maxHeight: "84%"
    },
    modalScroll: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    modalCard: {
      padding: 18,
      paddingBottom: 28
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900"
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    helperText: {
      marginTop: 12,
      color: theme.colors.textSoft,
      lineHeight: 20
    },
    imageManager: {
      marginTop: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    imagePreview: {
      width: "100%",
      height: 180,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceStrong
    },
    imagePlaceholder: {
      width: "100%",
      height: 180,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center",
      gap: 10
    },
    imagePlaceholderText: {
      color: theme.colors.textSoft,
      fontWeight: "700"
    },
    imageActions: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    secondaryButtonInline: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 16,
      paddingVertical: 11,
      paddingHorizontal: 14
    },
    deleteButtonInline: {
      backgroundColor: theme.colors.control,
      borderRadius: 16,
      paddingVertical: 11,
      paddingHorizontal: 14
    },
    deleteButtonText: {
      color: theme.colors.danger,
      fontWeight: "800"
    },
    input: {
      marginTop: 12,
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.text
    },
    textArea: {
      minHeight: 96,
      textAlignVertical: "top"
    },
    errorText: {
      marginTop: 12,
      color: theme.colors.danger,
      fontWeight: "700"
    },
    modalActions: {
      marginTop: 24,
      marginBottom: 10,
      flexDirection: "row",
      gap: 10
    },
    secondaryButtonWide: {
      flex: 1,
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    primaryButtonWide: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    buttonDisabled: {
      opacity: 0.72
    }
  });
