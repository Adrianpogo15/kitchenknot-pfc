import React from "react";
import { StyleSheet, Text, View } from "react-native";

import LogoIcon from "./LogoIcon";
import { useAppTheme } from "../../styles/theme";

export default function LogoMark({ compact = false }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <LogoIcon compact={compact} />
      <View>
        <Text style={[styles.brand, compact && styles.brandCompact]}>KitchenKnot</Text>
        <Text style={styles.tagline}>Recetas que conectan</Text>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  rowCompact: {
    gap: 10
  },
  brand: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text
  },
  brandCompact: {
    fontSize: 20
  },
  tagline: {
    color: theme.colors.textSoft,
    fontSize: 13,
    marginTop: 2
  }
});
