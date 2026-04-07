import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import DateField from "../../components/common/DateField";
import LoadingSplash from "../../components/common/LoadingSplash";
import LogoMark from "../../components/common/LogoMark";
import { loginUser, registerUser } from "../../services/authService";
import { useAppTheme } from "../../styles/theme";

const initialRegisterForm = {
  email: "",
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  bio: "",
  birthDate: "",
  avatarUrl: ""
};

const initialLoginForm = {
  email: "",
  password: ""
};

export default function AuthScreen({ initialMode = "login", onAuthenticated, onContinueAsGuest }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [mode, setMode] = useState(initialMode);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function updateRegisterField(field, value) {
    setRegisterForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateLoginField(field, value) {
    setLoginForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handlePickRegisterAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu galería para poder añadir una foto de perfil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const avatarUrl = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

      updateRegisterField("avatarUrl", avatarUrl);
    } catch (_error) {
      Alert.alert("No se pudo abrir la galería", "Inténtalo de nuevo desde tu dispositivo.");
    }
  }

  async function handleRegister() {
    setLoading(true);

    try {
      const response = await registerUser({
        ...registerForm,
        avatarUrl: registerForm.avatarUrl || null
      });

      await onAuthenticated(response.data.accessToken, response.data.user);
    } catch (error) {
      Alert.alert("Error en el registro", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);

    try {
      const response = await loginUser(loginForm);
      await onAuthenticated(response.data.accessToken, response.data.user);
    } catch (error) {
      Alert.alert("Error al iniciar sesión", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSplash />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundHalo} />
        <View style={styles.backgroundLeaf} />

        <View style={styles.heroCard}>
          <LogoMark />
          <Text style={styles.title}>Tu recetario empieza aquí</Text>
        </View>

        <View style={styles.modeSwitcher}>
          <ModeButton
            label="Iniciar sesión"
            active={mode === "login"}
            onPress={() => setMode("login")}
            theme={theme}
          />
          <ModeButton
            label="Registrarse"
            active={mode === "register"}
            onPress={() => setMode("register")}
            theme={theme}
          />
        </View>

        {mode === "login" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Iniciar sesión</Text>
            <LabeledInput
              label="Email"
              value={loginForm.email}
              onChangeText={(value) => updateLoginField("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="tu@email.com"
              onFocus={() => scrollRef.current?.scrollTo({ y: 180, animated: true })}
              theme={theme}
            />
            <LabeledInput
              label="Contraseña"
              value={loginForm.password}
              onChangeText={(value) => updateLoginField("password", value)}
              secureTextEntry
              placeholder="Introduce tu contraseña"
              onFocus={() => scrollRef.current?.scrollTo({ y: 260, animated: true })}
              theme={theme}
            />
            <Text style={styles.helperText}>La contraseña debe tener al menos 6 caracteres.</Text>
            <ActionButton label="Entrar" onPress={handleLogin} theme={theme} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Crear cuenta</Text>
            <LabeledInput
              label="Email"
              value={registerForm.email}
              onChangeText={(value) => updateRegisterField("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="tu@email.com"
              onFocus={() => scrollRef.current?.scrollTo({ y: 140, animated: true })}
              theme={theme}
            />
            <LabeledInput
              label="Nombre de usuario"
              value={registerForm.username}
              onChangeText={(value) => updateRegisterField("username", value)}
              autoCapitalize="none"
              placeholder="chef_verde"
              onFocus={() => scrollRef.current?.scrollTo({ y: 220, animated: true })}
              theme={theme}
            />
            <LabeledInput
              label="Contraseña"
              value={registerForm.password}
              onChangeText={(value) => updateRegisterField("password", value)}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
              onFocus={() => scrollRef.current?.scrollTo({ y: 300, animated: true })}
              theme={theme}
            />
            <Text style={styles.helperText}>
              Usa una contraseña de al menos 6 caracteres o más.
            </Text>
            <Pressable style={styles.avatarPicker} onPress={handlePickRegisterAvatar}>
              {registerForm.avatarUrl ? (
                <Image source={{ uri: registerForm.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlus}>+</Text>
                </View>
              )}
              <View style={styles.avatarInfo}>
                <Text style={styles.avatarTitle}>Foto de perfil opcional</Text>
                <Text style={styles.avatarSubtitle}>
                  {registerForm.avatarUrl
                    ? "Imagen seleccionada correctamente."
                    : "Puedes añadir una imagen ahora o dejarlo para más adelante."}
                </Text>
              </View>
            </Pressable>
            <LabeledInput
              label="Nombre"
              value={registerForm.firstName}
              onChangeText={(value) => updateRegisterField("firstName", value)}
              placeholder="Nombre"
              onFocus={() => scrollRef.current?.scrollTo({ y: 380, animated: true })}
              theme={theme}
            />
            <LabeledInput
              label="Apellidos"
              value={registerForm.lastName}
              onChangeText={(value) => updateRegisterField("lastName", value)}
              placeholder="Apellidos"
              onFocus={() => scrollRef.current?.scrollTo({ y: 460, animated: true })}
              theme={theme}
            />
            <LabeledInput
              label="Biografía"
              value={registerForm.bio}
              onChangeText={(value) => updateRegisterField("bio", value)}
              placeholder="Tu estilo culinario"
              multiline
              onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
              theme={theme}
            />
            <DateField
              label="Fecha de nacimiento"
              value={registerForm.birthDate}
              onChange={(value) => updateRegisterField("birthDate", value)}
            />
            <ActionButton label="Crear cuenta" onPress={handleRegister} theme={theme} />
          </View>
        )}

        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>Entrar como invitado</Text>
          
          <ActionButton
            label="Continuar como invitado"
            onPress={onContinueAsGuest}
            secondary
            theme={theme}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ModeButton({ label, active, onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={[styles.modeButton, active && styles.modeButtonActive]} onPress={onPress}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress, secondary, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable
      style={[styles.actionButton, secondary && styles.actionButtonSecondary]}
      onPress={onPress}
    >
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function LabeledInput({ label, multiline, onFocus, theme, ...props }) {
  const styles = createStyles(theme);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={onFocus}
        {...props}
      />
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    root: {
      flex: 1
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 44,
      paddingBottom: 40,
      backgroundColor: theme.colors.background
    },
    backgroundHalo: {
      position: "absolute",
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor: theme.colors.primarySoft,
      top: -90,
      right: -90,
      opacity: 0.85
    },
    backgroundLeaf: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 999,
      backgroundColor: theme.colors.cream,
      bottom: 70,
      left: -90,
      opacity: 0.65
    },
    heroCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 34,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    title: {
      fontSize: 30,
      fontWeight: "900",
      color: theme.colors.text,
      lineHeight: 37,
      marginTop: 24
    },
    subtitle: {
      marginTop: 12,
      color: theme.colors.textSoft,
      lineHeight: 23,
      fontSize: 15
    },
    modeSwitcher: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 22,
      padding: 6,
      marginTop: 18,
      marginBottom: 16
    },
    modeButton: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 12,
      alignItems: "center"
    },
    modeButtonActive: {
      backgroundColor: theme.isDark ? theme.colors.primary : theme.colors.white
    },
    modeText: {
      color: theme.colors.textMuted,
      fontWeight: "800"
    },
    modeTextActive: {
      color: theme.isDark ? theme.colors.white : theme.colors.text
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 30,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 10
    },
    formInfo: {
      color: theme.colors.textSoft,
      lineHeight: 21,
      marginBottom: 12
    },
    fieldWrapper: {
      marginBottom: 12
    },
    fieldLabel: {
      marginBottom: 8,
      color: theme.colors.textSoft,
      fontSize: 13,
      fontWeight: "700"
    },
    input: {
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 15,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text
    },
    textArea: {
      minHeight: 110
    },
    helperText: {
      color: theme.colors.textMuted,
      lineHeight: 19,
      marginTop: -2,
      marginBottom: 8,
      fontSize: 13
    },
    avatarPicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 14,
      marginBottom: 14
    },
    avatarPlaceholder: {
      width: 58,
      height: 58,
      borderRadius: 22,
      backgroundColor: theme.colors.primarySoft,
      alignItems: "center",
      justifyContent: "center"
    },
    avatarImage: {
      width: 58,
      height: 58,
      borderRadius: 22
    },
    avatarPlus: {
      fontSize: 28,
      color: theme.colors.primaryStrong,
      fontWeight: "700"
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
    actionButton: {
      marginTop: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: "center"
    },
    actionButtonSecondary: {
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white
    },
    actionButtonText: {
      color: theme.colors.white,
      fontWeight: "800",
      fontSize: 15
    },
    actionButtonTextSecondary: {
      color: theme.colors.primaryStrong
    },
    guestCard: {
      marginTop: 16,
      backgroundColor: theme.colors.primarySoft,
      borderRadius: 28,
      padding: 18
    },
    guestTitle: {
      color: theme.colors.text,
      fontSize: 21,
      fontWeight: "800"
    },
    guestText: {
      color: theme.colors.textSoft,
      marginTop: 8,
      lineHeight: 21
    }
  });
