import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ScreenShell from "../../components/common/ScreenShell";
import { useAppTheme } from "../../styles/theme";

export default function PlaceholderSectionScreen({ eyebrow, title, description }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </ScreenShell>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow
  },
  eyebrow: {
    color: theme.colors.accentStrong,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 12,
    fontWeight: "800"
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 10
  },
  description: {
    color: theme.colors.textSoft,
    marginTop: 12,
    lineHeight: 24,
    fontSize: 15
  }
});
