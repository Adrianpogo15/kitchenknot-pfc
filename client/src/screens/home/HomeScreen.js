import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ScreenShell from "../../components/common/ScreenShell";
import QuickAccessCard from "../../components/home/QuickAccessCard";
import { quickAccessSections } from "../../constants/navigation";
import { useAppTheme } from "../../styles/theme";

export default function HomeScreen({ isGuest, profile, onNavigate }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const greetingName = isGuest
    ? "chef invitado"
    : profile?.profile?.firstName || profile?.username || "chef";

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.title}>Bienvenido/a, {greetingName}</Text>
        <Text style={styles.subtitle}>
          Accede rápidamente a las secciones principales de tu cocina. 
        </Text>
      </View>

      <View style={styles.quickCard}>
        <Text style={styles.quickEyebrow}>Accesos rápidos</Text>
        <Text style={styles.quickTitle}>Todo lo importante a un solo paso</Text>
        <View style={styles.quickGrid}>
          {quickAccessSections.map((item) => (
            <QuickAccessCard
              key={item.key}
              label={item.label}
              icon={item.icon}
              color={item.quickAccessColor}
              description={item.description}
              onPress={() => onNavigate(item.key)}
            />
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    hero: {
      backgroundColor: theme.colors.surface,
      borderRadius: 30,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    title: {
      fontSize: 31,
      lineHeight: 38,
      color: theme.colors.text,
      fontWeight: "900",
      marginTop: 4
    },
    subtitle: {
      marginTop: 12,
      color: theme.colors.textSoft,
      lineHeight: 24,
      fontSize: 15
    },
    quickCard: {
      marginTop: 18,
      backgroundColor: theme.isDark ? "#16312a" : theme.colors.primary,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.isDark ? "#29443d" : "transparent",
      ...theme.shadow
    },
    quickEyebrow: {
      color: theme.isDark ? "#b7d6c9" : "#d8eee7",
      textTransform: "uppercase",
      letterSpacing: 1.8,
      fontSize: 12,
      fontWeight: "800"
    },
    quickTitle: {
      color: theme.colors.white,
      fontSize: 22,
      fontWeight: "800",
      marginTop: 8
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 14
    }
  });
