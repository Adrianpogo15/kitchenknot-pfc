import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EmptyResultsState from "../../components/common/EmptyResultsState";
import ScreenShell from "../../components/common/ScreenShell";
import PaginationControls from "../../components/recipes/PaginationControls";
import RecipeCard from "../../components/recipes/RecipeCard";
import { CUISINE_OPTIONS, MEAL_TYPE_OPTIONS } from "../../constants/recipeFilters";
import { searchMeals } from "../../services/mealService";
import { useAppTheme } from "../../styles/theme";

export default function SearchScreen({ onOpenRecipe }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  async function performSearch(nextPage = 1, overrides = {}) {
    const payload = {
      name: query,
      cuisineType:
        overrides.cuisineType !== undefined ? overrides.cuisineType : selectedCuisine,
      mealType: overrides.mealType !== undefined ? overrides.mealType : selectedMealType,
      page: nextPage,
      pageSize: 10
    };

    if (!payload.name.trim() && !payload.cuisineType && !payload.mealType) {
      setError("Escribe un nombre o selecciona al menos un filtro.");
      setMeals([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const response = await searchMeals(payload);

      setMeals(response.data || []);
      setPage(response.page || nextPage);
      setTotalPages(response.totalPages || 0);
      setTotal(response.total || 0);
    } catch (requestError) {
      setMeals([]);
      setTotal(0);
      setTotalPages(0);
      setError(requestError.message || "No se han podido cargar los resultados.");
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setSelectedCuisine("");
    setSelectedMealType("");
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Buscador</Text>
        <Text style={styles.title}>Explora recetas</Text>
        <Text style={styles.subtitle}>
          Busca por nombre y usa filtros avanzados para encontrar recetas de diversas fuentes externas.
        </Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Nombre de la receta</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ejemplo: arroz, pollo o tortilla"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => performSearch(1)}
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.searchButton} onPress={() => performSearch(1)}>
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="search-outline" size={18} color={theme.colors.white} />
                <Text style={styles.searchButtonText}>Buscar</Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.filterToggle} onPress={() => setFiltersOpen((value) => !value)}>
            <Ionicons name="options-outline" size={18} color={theme.colors.primaryStrong} />
            <Text style={styles.filterToggleText}>Filtros</Text>
          </Pressable>
        </View>

        {filtersOpen ? (
          <View style={styles.advancedFilters}>
            <FilterSection
              title="Tipo de cocina"
              options={CUISINE_OPTIONS}
              selectedValue={selectedCuisine}
              onSelect={setSelectedCuisine}
              theme={theme}
            />
            <FilterSection
              title="Momento del día"
              options={MEAL_TYPE_OPTIONS}
              selectedValue={selectedMealType}
              onSelect={setSelectedMealType}
              theme={theme}
            />

            <View style={styles.filterActions}>
              <Pressable style={styles.secondaryButton} onPress={resetFilters}>
                <Text style={styles.secondaryButtonText}>Limpiar filtros</Text>
              </Pressable>
              <Pressable style={styles.primaryButtonSmall} onPress={() => performSearch(1)}>
                <Text style={styles.primaryButtonSmallText}>Aplicar filtros</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Resultados</Text>
        {hasSearched && !loading ? (
          <Text style={styles.resultsMeta}>
            Página {page} de {Math.max(totalPages, 1)} - {total} recetas
          </Text>
        ) : null}
      </View>

      {!loading && hasSearched && meals.length === 0 && !error ? (
        <EmptyResultsState
          title="No hemos encontrado recetas"
          description="Prueba con otro nombre o cambia los filtros para ampliar la búsqueda."
        />
      ) : null}

      {meals.map((meal) => (
        <RecipeCard
          key={meal.externalId}
          recipe={meal}
          allowFavorite={false}
          onPress={() => onOpenRecipe?.(meal)}
        />
      ))}

      {hasSearched && totalPages > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrevious={() => performSearch(page - 1)}
          onNext={() => performSearch(page + 1)}
          disabled={loading}
        />
      ) : null}
    </ScreenShell>
  );
}

function FilterSection({ title, options, selectedValue, onSelect, theme }) {
  const styles = createStyles(theme);

  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.filterOptionsWrap}>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={selectedValue === option.value}
            onPress={() => onSelect(selectedValue === option.value ? "" : option.value)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

function FilterChip({ label, selected, onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
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
    buttonRow: {
      marginTop: 14,
      flexDirection: "row",
      gap: 10
    },
    searchButton: {
      flex: 1,
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
      fontWeight: "800",
      fontSize: 15
    },
    filterToggle: {
      backgroundColor: theme.colors.primarySoft,
      borderRadius: 18,
      paddingVertical: 15,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8
    },
    filterToggleText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    advancedFilters: {
      marginTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16
    },
    filterSection: {
      marginBottom: 14
    },
    filterSectionTitle: {
      color: theme.colors.text,
      fontWeight: "800",
      marginBottom: 10
    },
    filterOptionsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    filterActions: {
      marginTop: 4,
      flexDirection: "row",
      gap: 10
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      borderRadius: 16,
      paddingVertical: 13,
      alignItems: "center"
    },
    secondaryButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    primaryButtonSmall: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 13,
      alignItems: "center"
    },
    primaryButtonSmallText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    errorText: {
      marginTop: 12,
      color: theme.colors.danger,
      fontWeight: "700"
    },
    chip: {
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9
    },
    chipSelected: {
      backgroundColor: theme.colors.primary
    },
    chipText: {
      color: theme.colors.primaryStrong,
      fontWeight: "700",
      fontSize: 13
    },
    chipTextSelected: {
      color: theme.colors.white
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
    },
    emptyState: {}
  });
