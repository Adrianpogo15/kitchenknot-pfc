import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenShell from "../../components/common/ScreenShell";
import PaginationControls from "../../components/recipes/PaginationControls";
import RecipeCard from "../../components/recipes/RecipeCard";
import { addFavorite, getFavoriteStatuses, removeFavorite } from "../../services/favoriteService";
import { searchMeals } from "../../services/mealService";
import { useAppTheme } from "../../styles/theme";

export default function CategoryRecipesScreen({ category, token, isGuest, onRequireAuth }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  async function loadRecipes(nextPage = 1) {
    try {
      setLoading(true);
      setError("");

      const response = await searchMeals({
        name: query,
        dishType: category?.value,
        page: nextPage,
        pageSize: 10
      });

      setRecipes(response.data || []);
      setPage(response.page || nextPage);
      setTotalPages(response.totalPages || 0);
      setTotal(response.total || 0);

      if (!isGuest && token && response.data?.length) {
        const favoriteStatus = await getFavoriteStatuses(
          token,
          response.data.map((item) => item.externalId)
        );
        setFavoriteIds(favoriteStatus.data || []);
      } else {
        setFavoriteIds([]);
      }
    } catch (requestError) {
      setRecipes([]);
      setTotal(0);
      setTotalPages(0);
      setError(requestError.message || "No se han podido cargar las recetas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes(1);
  }, [category?.value]);

  async function handleToggleFavorite(recipe) {
    if (!token) {
      onRequireAuth?.();
      return;
    }

    const isFavorite = favoriteIds.includes(recipe.externalId);

    if (isFavorite) {
      await removeFavorite(token, recipe.externalId);
      setFavoriteIds((current) => current.filter((id) => id !== recipe.externalId));
      return;
    }

    await addFavorite(token, recipe);
    setFavoriteIds((current) => [...current, recipe.externalId]);
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Categoría</Text>
        <Text style={styles.title}>{category?.label || "Recetas por categoría"}</Text>
        <Text style={styles.subtitle}>
          Usa el buscador para afinar dentro de esta categoría y navega por páginas de 10 recetas.
        </Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Buscar dentro de la categoría</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Escribe un nombre de receta"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => loadRecipes(1)}
        />
        <Pressable style={styles.searchButton} onPress={() => loadRecipes(1)}>
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="search-outline" size={18} color={theme.colors.white} />
              <Text style={styles.searchButtonText}>Buscar</Text>
            </>
          )}
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Resultados</Text>
        <Text style={styles.resultsMeta}>
          Página {page} de {Math.max(totalPages, 1)} - {total} recetas
        </Text>
      </View>

      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.externalId}
          recipe={recipe}
          isFavorite={favoriteIds.includes(recipe.externalId)}
          onToggleFavorite={handleToggleFavorite}
          isGuest={isGuest}
          onRequireAuth={onRequireAuth}
        />
      ))}

      {totalPages > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrevious={() => loadRecipes(page - 1)}
          onNext={() => loadRecipes(page + 1)}
          disabled={loading}
        />
      ) : null}
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
    searchCard: {
      marginTop: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    label: {
      color: theme.colors.text,
      fontWeight: "800",
      marginBottom: 10
    },
    input: {
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.text
    },
    searchButton: {
      marginTop: 14,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8
    },
    searchButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    errorText: {
      marginTop: 12,
      color: theme.colors.danger,
      fontWeight: "700"
    },
    resultsHeader: {
      marginTop: 18,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between"
    },
    resultsTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900"
    },
    resultsMeta: {
      color: theme.colors.textSoft,
      fontSize: 13,
      fontWeight: "700"
    }
  });
