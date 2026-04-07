import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenShell from "../../components/common/ScreenShell";
import { CATEGORY_OPTIONS } from "../../constants/recipeFilters";
import { useAppTheme } from "../../styles/theme";

export default function CategoriesScreen({ onOpenCategory }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Categorías</Text>
        <Text style={styles.title}>Explora recetas por categoría</Text>
        <Text style={styles.subtitle}>
          Elige una categoría para ver recetas relacionadas y luego podrás filtrar por nombre dentro
          de cada listado.
        </Text>
      </View>

      <View style={styles.grid}>
        {CATEGORY_OPTIONS.map((category) => (
          <Pressable
            key={category.value}
            style={styles.categoryCard}
            onPress={() => onOpenCategory(category)}
          >
            <Ionicons name="restaurant-outline" size={22} color={theme.colors.primaryStrong} />
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </Pressable>
        ))}
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
    eyebrow: {
      color: theme.colors.accentStrong,
      textTransform: "uppercase",
      letterSpacing: 1.8,
      fontSize: 12,
      fontWeight: "800"
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
    grid: {
      marginTop: 18,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12
    },
    categoryCard: {
      width: "47%",
      minHeight: 108,
      borderRadius: 22,
      padding: 16,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.cream,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "space-between"
    },
    categoryLabel: {
      color: theme.colors.text,
      fontWeight: "800",
      fontSize: 15,
      lineHeight: 20
    }
  });
