import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LogoIcon from "./LogoIcon";
import { appSections } from "../../constants/navigation";
import { useAppTheme } from "../../styles/theme";

export default function AppDrawer({
  children,
  activeScreen,
  onNavigate,
  profile,
  isGuest,
  onLoginPress,
  onRegisterPress,
  onLogout
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme, mode, setMode } = useAppTheme();
  const styles = createStyles(theme);

  const userTitle = useMemo(
    () => (isGuest ? "Modo invitado" : profile?.profile?.firstName || profile?.username || "Usuario"),
    [isGuest, profile]
  );

  const userSubtitle = useMemo(
    () => (isGuest ? "Acceso a funciones públicas" : profile?.email || "Perfil personal"),
    [isGuest, profile]
  );

  function handleNavigate(screen) {
    onNavigate(screen);
    setOpen(false);
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable style={styles.menuButton} onPress={() => setOpen(true)}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, styles.menuLineShort]} />
        </Pressable>
        <View style={styles.topBarBrand}>
          <Text style={styles.topBarTitle}>KitchenKnot</Text>
          <LogoIcon compact />
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.drawer}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.drawerScrollContent,
                    { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) }
                  ]}
                >
                  <View style={styles.drawerTopRow}>
                    <Text style={styles.drawerTitle}>Navegación</Text>
                    <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
                      <Ionicons name="close" size={20} color={theme.colors.primaryStrong} />
                    </Pressable>
                  </View>

                  <View style={styles.drawerHeader}>
                    {isGuest ? (
                      <View style={styles.guestActions}>
                        <Text style={styles.guestHeadline}>Explora como invitado</Text>
                        <Text style={styles.guestText}>
                          Puedes ver recetas públicas ahora y acceder más tarde para guardar tus
                          favoritas.
                        </Text>
                        <Pressable style={styles.primaryAction} onPress={onLoginPress}>
                          <Text style={styles.primaryActionText}>Iniciar sesión</Text>
                        </Pressable>
                        <Pressable style={styles.secondaryAction} onPress={onRegisterPress}>
                          <Text style={styles.secondaryActionText}>Registrarse</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <>
                        {profile?.profile?.avatarUrl ? (
                          <Image
                            source={{ uri: profile.profile.avatarUrl }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {(profile?.username || "U").slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.userTitle}>{userTitle}</Text>
                        <Text style={styles.userSubtitle}>{userSubtitle}</Text>
                      </>
                    )}
                  </View>

                  <View style={styles.navSection}>
                    {appSections.map((item) => (
                      <NavItem
                        key={item.key}
                        label={item.label}
                        icon={item.icon}
                        active={activeScreen === item.key}
                        onPress={() => handleNavigate(item.key)}
                        theme={theme}
                      />
                    ))}
                  </View>

                  <View style={styles.bottomControls}>
                    <View style={styles.themeSwitcher}>
                      <ThemeModeButton
                        label="Claro"
                        icon="sunny-outline"
                        active={mode === "light"}
                        onPress={() => setMode("light")}
                        theme={theme}
                      />
                      <ThemeModeButton
                        label="Oscuro"
                        icon="moon-outline"
                        active={mode === "dark"}
                        onPress={() => setMode("dark")}
                        theme={theme}
                      />
                    </View>

                    {!isGuest ? (
                      <Pressable
                        style={styles.logoutButton}
                        onPress={() => {
                          setOpen(false);
                          onLogout();
                        }}
                      >
                        <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
                        <Text style={styles.logoutButtonText}>Salir</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function NavItem({ label, active, icon, onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
      <Ionicons
        name={icon}
        size={20}
        color={active ? theme.colors.white : theme.colors.primaryStrong}
      />
      <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ThemeModeButton({ label, icon, active, onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={[styles.modeToggle, active && styles.modeToggleActive]} onPress={onPress}>
      <Ionicons
        name={icon}
        size={18}
        color={active ? theme.colors.white : theme.colors.primaryStrong}
      />
      <Text style={[styles.modeToggleText, active && styles.modeToggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    root: {
      flex: 1
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 4,
      backgroundColor: theme.isDark ? "#16312a" : "transparent"
    },
    topBarTitle: {
      color: theme.isDark ? "#d9eadf" : theme.colors.primaryStrong,
      fontSize: 22,
      fontWeight: "900"
    },
    topBarBrand: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    menuButton: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.isDark ? "#1d2a27" : theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.isDark ? "#395048" : theme.colors.border
    },
    menuLine: {
      width: 20,
      height: 2.5,
      borderRadius: 99,
      backgroundColor: theme.isDark ? "#d9eadf" : theme.colors.primary,
      marginVertical: 2
    },
    menuLineShort: {
      width: 14
    },
    content: {
      flex: 1
    },
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "flex-start"
    },
    drawer: {
      width: "86%",
      maxWidth: 360,
      backgroundColor: theme.colors.surface,
      height: "100%"
    },
    drawerScrollContent: {
      paddingHorizontal: 16,
      flexGrow: 1
    },
    drawerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    drawerTitle: {
      color: theme.colors.primaryStrong,
      fontSize: 18,
      fontWeight: "900"
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    drawerHeader: {
      marginTop: 10,
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10
    },
    avatarImage: {
      width: 56,
      height: 56,
      borderRadius: 18,
      marginBottom: 10
    },
    avatarText: {
      color: theme.colors.white,
      fontSize: 22,
      fontWeight: "900"
    },
    userTitle: {
      color: theme.colors.text,
      fontSize: 19,
      fontWeight: "800"
    },
    userSubtitle: {
      color: theme.colors.textSoft,
      marginTop: 4,
      lineHeight: 19,
      fontSize: 13
    },
    guestActions: {
      gap: 8
    },
    guestHeadline: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: "800",
      marginTop: 6
    },
    guestText: {
      color: theme.colors.textSoft,
      lineHeight: 19,
      fontSize: 13
    },
    primaryAction: {
      marginTop: 4,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center"
    },
    primaryActionText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    secondaryAction: {
      backgroundColor: theme.colors.primarySoft,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center"
    },
    secondaryActionText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    navSection: {
      marginTop: 16,
      gap: 8
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong
    },
    navItemActive: {
      backgroundColor: theme.colors.primary
    },
    navItemText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: 15
    },
    navItemTextActive: {
      color: theme.colors.white
    },
    bottomControls: {
      marginTop: 14,
      gap: 10
    },
    themeSwitcher: {
      flexDirection: "row",
      gap: 8
    },
    modeToggle: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      borderRadius: 16,
      paddingVertical: 12,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    modeToggleActive: {
      backgroundColor: theme.colors.primary
    },
    modeToggleText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800",
      fontSize: 14
    },
    modeToggleTextActive: {
      color: theme.colors.white
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.control
    },
    logoutButtonText: {
      color: theme.colors.danger,
      fontWeight: "800",
      fontSize: 15
    }
  });
