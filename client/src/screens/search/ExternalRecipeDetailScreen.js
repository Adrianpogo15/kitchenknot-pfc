import React from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import RecipeDetailSkeleton from "../../components/recipes/RecipeDetailSkeleton";
import ScreenShell from "../../components/common/ScreenShell";
import { TRANSLATIONS } from "../../constants/recipeFilters";
import { useAppTheme } from "../../styles/theme";

function translateItems(items, dictionary) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  return items.map((item) => dictionary[item] || item).join(" · ");
}

export default function ExternalRecipeDetailScreen({ recipe, onBack }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  if (!recipe) {
    return (
      <ScreenShell>
        <RecipeDetailSkeleton />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back-outline" size={20} color={theme.colors.primaryStrong} />
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant-outline" size={32} color={theme.colors.primaryStrong} />
            <Text style={styles.placeholderText}>Imagen no disponible</Text>
          </View>
        )}

        <View style={styles.heroBody}>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.source}>Fuente: {recipe.source || "Edamam"}</Text>

          <View style={styles.metaWrap}>
            {recipe.servings ? <MetaChip theme={theme} label={`${recipe.servings} personas`} /> : null}
            {recipe.totalTime ? <MetaChip theme={theme} label={`${recipe.totalTime} min`} /> : null}
            {recipe.calories ? <MetaChip theme={theme} label={`${recipe.calories} kcal`} /> : null}
          </View>

          {translateItems(recipe.cuisineType, TRANSLATIONS.cuisineType) ? (
            <Text style={styles.metaText}>
              Cocina: {translateItems(recipe.cuisineType, TRANSLATIONS.cuisineType)}
            </Text>
          ) : null}
          {translateItems(recipe.mealType, TRANSLATIONS.mealType) ? (
            <Text style={styles.metaText}>
              Momento: {translateItems(recipe.mealType, TRANSLATIONS.mealType)}
            </Text>
          ) : null}
          {translateItems(recipe.dishType, TRANSLATIONS.dishType) ? (
            <Text style={styles.metaText}>
              Categoría: {translateItems(recipe.dishType, TRANSLATIONS.dishType)}
            </Text>
          ) : null}

          {recipe.sourceUrl ? (
            <Pressable style={styles.linkButton} onPress={() => Linking.openURL(recipe.sourceUrl)}>
              <Ionicons name="open-outline" size={18} color={theme.colors.white} />
              <Text style={styles.linkButtonText}>Abrir receta original</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {(recipe.ingredientLines || []).map((ingredient, index) => (
          <Text key={`${ingredient}-${index}`} style={styles.lineItem}>
            • {ingredient}
          </Text>
        ))}
      </View>
    </ScreenShell>
  );
}

function MetaChip({ label, theme }) {
  const styles = createStyles(theme);

  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    topRow: {
      marginBottom: 10
    },
    backButton: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: theme.colors.surface
    },
    backButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    hero: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    image: {
      width: "100%",
      height: 220,
      backgroundColor: theme.colors.surfaceStrong
    },
    placeholderImage: {
      width: "100%",
      height: 220,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center",
      gap: 12
    },
    placeholderText: {
      color: theme.colors.textSoft,
      fontWeight: "700"
    },
    heroBody: {
      padding: 20
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "900"
    },
    source: {
      marginTop: 8,
      color: theme.colors.textSoft
    },
    metaWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 14
    },
    metaChip: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12
    },
    metaChipText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    metaText: {
      marginTop: 10,
      color: theme.colors.textSoft,
      lineHeight: 22
    },
    linkButton: {
      marginTop: 16,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    linkButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    section: {
      marginTop: 18,
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900"
    },
    lineItem: {
      marginTop: 10,
      color: theme.colors.textSoft,
      lineHeight: 22
    }
  });
