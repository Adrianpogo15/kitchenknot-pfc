import React from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { TRANSLATIONS } from "../../constants/recipeFilters";
import { useAppTheme } from "../../styles/theme";
import { normalizeImageUri } from "../../utils/image";

function translateItems(items, dictionary) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items.map((item) => dictionary[item] || item).join(" · ");
}

function renderStars(theme, averageRating) {
  const rounded = Math.round(Number(averageRating || 0));
  const stars = [];

  for (let index = 1; index <= 5; index += 1) {
    stars.push(
      <Ionicons
        key={index}
        name={index <= rounded ? "star" : "star-outline"}
        size={14}
        color={index <= rounded ? "#d8a83f" : theme.colors.textMuted}
      />
    );
  }

  return stars;
}

export default function RecipeCard({
  recipe,
  isFavorite = false,
  onToggleFavorite,
  onAddToShoppingList,
  onPress,
  isGuest = false,
  onRequireAuth,
  variant = "external",
  allowFavorite = true
}) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const isUserRecipe = variant === "user";
  const imageUri = normalizeImageUri(recipe.image);

  function handleFavoritePress(event) {
    event?.stopPropagation?.();

    if (!allowFavorite) {
      return;
    }

    if (isGuest) {
      if (onRequireAuth) {
        onRequireAuth();
        return;
      }

      Alert.alert("Inicia sesión", "Necesitas una cuenta para guardar favoritos.");
      return;
    }

    onToggleFavorite?.(recipe);
  }

  function handleShoppingPress(event) {
    event?.stopPropagation?.();

    if (isGuest) {
      if (onRequireAuth) {
        onRequireAuth();
        return;
      }

      Alert.alert("Inicia sesión", "Necesitas una cuenta para guardar ingredientes en tus listas.");
      return;
    }

    onAddToShoppingList?.(recipe);
  }

  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper style={styles.card} onPress={onPress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="restaurant-outline" size={28} color={theme.colors.primaryStrong} />
          <Text style={styles.placeholderText}>Imagen no disponible</Text>
        </View>
      )}

      <View style={styles.content}>
        {isUserRecipe ? (
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={2}>
              {recipe.name}
            </Text>
            {recipe.servings ? (
              <View style={styles.servingsChip}>
                <Ionicons name="people-outline" size={14} color={theme.colors.white} />
                <Text style={styles.servingsChipText}>{recipe.servings}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.name}>{recipe.name}</Text>
        )}

        {isUserRecipe ? (
          <>
            {recipe.category ? <Text style={styles.metaLine}>Categoría: {recipe.category}</Text> : null}
            {recipe.difficulty ? <Text style={styles.metaLine}>Dificultad: {recipe.difficulty}</Text> : null}
            {recipe.author ? (
              <Text style={styles.authorLine}>
                Por {recipe.author.firstName || recipe.author.username || "usuario"}
              </Text>
            ) : null}
            <View style={styles.bottomRow}>
              <View style={styles.ratingRow}>
                <View style={styles.starsWrap}>{renderStars(theme, recipe.averageRating)}</View>
                <Text style={styles.ratingText}>
                  {Number(recipe.averageRating || 0).toFixed(1)} ({recipe.ratingsCount || 0})
                </Text>
              </View>
              <View style={styles.actionsRow}>
                <Pressable style={styles.favoriteButtonInline} onPress={handleShoppingPress}>
                  <Ionicons
                    name="cart-outline"
                    size={20}
                    color={theme.colors.primaryStrong}
                  />
                </Pressable>
                {allowFavorite ? (
                  <Pressable style={styles.favoriteButtonInline} onPress={handleFavoritePress}>
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={22}
                      color={isFavorite ? "#d35b73" : theme.colors.primaryStrong}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          </>
        ) : (
          <>
            {translateItems(recipe.cuisineType, TRANSLATIONS.cuisineType) ? (
              <Text style={styles.metaLine}>
                Cocina: {translateItems(recipe.cuisineType, TRANSLATIONS.cuisineType)}
              </Text>
            ) : null}
            {translateItems(recipe.mealType, TRANSLATIONS.mealType) ? (
              <Text style={styles.metaLine}>
                Momento: {translateItems(recipe.mealType, TRANSLATIONS.mealType)}
              </Text>
            ) : null}
            {translateItems(recipe.dishType, TRANSLATIONS.dishType) ? (
              <Text style={styles.metaLine}>
                Categoría: {translateItems(recipe.dishType, TRANSLATIONS.dishType)}
              </Text>
            ) : null}
          </>
        )}

        {!isUserRecipe && allowFavorite ? (
          <View style={styles.footer}>
            <View style={styles.spacer} />
            <Pressable style={styles.favoriteButton} onPress={handleFavoritePress}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#d35b73" : theme.colors.primaryStrong}
              />
            </Pressable>
          </View>
        ) : null}
      </View>
    </CardWrapper>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      marginTop: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    image: {
      width: "100%",
      height: 190,
      backgroundColor: theme.colors.surfaceStrong
    },
    placeholderImage: {
      width: "100%",
      height: 190,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center",
      gap: 10
    },
    placeholderText: {
      color: theme.colors.textSoft,
      fontWeight: "700"
    },
    content: {
      padding: 16
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10
    },
    name: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "900",
      flex: 1,
      lineHeight: 26
    },
    metaLine: {
      marginTop: 8,
      color: theme.colors.textSoft,
      lineHeight: 20
    },
    authorLine: {
      marginTop: 8,
      color: theme.colors.textMuted,
      fontSize: 13,
      fontStyle: "italic"
    },
    servingsChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 11,
      alignSelf: "flex-start",
      marginTop: 1
    },
    servingsChipText: {
      color: theme.colors.white,
      fontWeight: "800",
      fontSize: 12
    },
    bottomRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      minHeight: 40
    },
    starsWrap: {
      flexDirection: "row",
      gap: 2
    },
    ratingText: {
      color: theme.colors.textSoft,
      fontWeight: "700",
      fontSize: 13
    },
    footer: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    spacer: {
      flex: 1
    },
    favoriteButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    favoriteButtonInline: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    }
  });
