import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../styles/theme";

export default function LogoIcon({ compact = false }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.logoShell, compact && styles.logoShellCompact]}>
      <View style={styles.logoLeafOne} />
      <View style={styles.logoLeafTwo} />
      <View style={[styles.logoCenter, compact && styles.logoCenterCompact]}>
        <Text style={[styles.logoText, compact && styles.logoTextCompact]}>K</Text>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
  logoShell: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  logoShellCompact: {
    width: 38,
    height: 38,
    borderRadius: 13
  },
  logoLeafOne: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    top: -4,
    right: 6,
    transform: [{ rotate: "28deg" }]
  },
  logoLeafTwo: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: theme.colors.cream,
    bottom: -5,
    left: -2,
    transform: [{ rotate: "-18deg" }]
  },
  logoCenter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center"
  },
  logoCenterCompact: {
    width: 22,
    height: 22,
    borderRadius: 11
  },
  logoText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "800"
  },
  logoTextCompact: {
    fontSize: 12
  }
});
