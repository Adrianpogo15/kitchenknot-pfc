import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../styles/theme";

export default function QuickAccessCard({ label, icon, color, description, onPress }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const backgroundColor = theme.isDark ? "#22302c" : color;

  return (
    <Pressable style={[styles.card, { backgroundColor }]} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={22}
          color={theme.isDark ? theme.colors.white : theme.colors.primaryStrong}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      width: "47%",
      minHeight: 158,
      borderRadius: 22,
      padding: 16,
      justifyContent: "flex-start",
      borderWidth: 1,
      borderColor: theme.isDark ? "#31423c" : theme.colors.creamStrong
    },
    iconWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
      backgroundColor: theme.isDark ? "#355046" : "rgba(255,255,255,0.72)",
      alignItems: "center",
      justifyContent: "center"
    },
    content: {
      marginTop: 18,
      minHeight: 78,
      justifyContent: "flex-start"
    },
    label: {
      color: theme.isDark ? theme.colors.text : theme.colors.primaryStrong,
      fontWeight: "800",
      lineHeight: 22,
      fontSize: 16
    },
    description: {
      marginTop: 8,
      color: theme.isDark ? "#c5d3cd" : theme.colors.textSoft,
      fontSize: 13,
      lineHeight: 19
    }
  });
