import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EmptyResultsState from "../../components/common/EmptyResultsState";
import ScreenShell from "../../components/common/ScreenShell";
import PaginationControls from "../../components/recipes/PaginationControls";
import RecipeCard from "../../components/recipes/RecipeCard";
import AddRecipeToShoppingListModal from "../../components/shopping/AddRecipeToShoppingListModal";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import { useAppTheme } from "../../styles/theme";

export default function FavoritesScreen({ token, isGuest, onRequireAuth, onOpenRecipe }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [selectedRecipeForList, setSelectedRecipeForList] = useState(null);

  async function loadFavorites(nextPage = 1, overrides = {}) {
    if (isGuest || !token) {
      setRecipes([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getFavorites(token, {
        name: overrides.name !== undefined ? overrides.name : query,
        page: nextPage,
        pageSize: 10
      });

      setRecipes(response.data || []);
      setPage(response.page || nextPage);
      setTotalPages(response.totalPages || 0);
      setTotal(response.total || 0);
    } catch (requestError) {
      setRecipes([]);
      setError(requestError.message || "No se han podido cargar tus favoritos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites(1);
  }, [token, isGuest]);

  async function handleToggleFavorite(recipe) {
    await removeFavorite(token, recipe.id);
    await loadFavorites(page);
  }

  if (isGuest) {
    return (
      <ScreenShell>
        <View style={styles.guestCard}>
          <Text style={styles.title}>Tus favoritos necesitan una cuenta</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para guardar recetas favoritas y consultarlas cuando quieras.
          </Text>
          <Pressable style={styles.searchButton} onPress={onRequireAuth}>
            <Text style={styles.searchButtonText}>Ir al acceso</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Favoritos</Text>
        <Text style={styles.title}>Tus recetas guardadas</Text>
        <Text style={styles.subtitle}>
          Filtra tus favoritos por nombre y navega por páginas de 10 resultados.
        </Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Buscar en favoritos</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Escribe el nombre de una receta"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => loadFavorites(1)}
        />
        <Pressable style={styles.searchButton} onPress={() => loadFavorites(1)}>
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

      {!loading && recipes.length === 0 && !error ? (
        <EmptyResultsState
          title="No tienes recetas favoritas guardadas"
          description="Explora recetas de usuarios y usa el corazón para empezar a guardar tus favoritas."
        />
      ) : null}

      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          isFavorite
          onToggleFavorite={handleToggleFavorite}
          variant="user"
          onAddToShoppingList={setSelectedRecipeForList}
          onPress={() => onOpenRecipe?.(recipe)}
        />
      ))}

      {totalPages > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrevious={() => loadFavorites(page - 1)}
          onNext={() => loadFavorites(page + 1)}
          disabled={loading}
        />
      ) : null}

      <AddRecipeToShoppingListModal
        visible={Boolean(selectedRecipeForList)}
        token={token}
        recipe={selectedRecipeForList}
        onClose={() => setSelectedRecipeForList(null)}
      />
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
    guestCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 30,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border
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
