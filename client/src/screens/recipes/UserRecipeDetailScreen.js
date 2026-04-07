import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EmptyResultsState from "../../components/common/EmptyResultsState";
import ScreenShell from "../../components/common/ScreenShell";
import RecipeDetailSkeleton from "../../components/recipes/RecipeDetailSkeleton";
import AddRecipeToShoppingListModal from "../../components/shopping/AddRecipeToShoppingListModal";
import { addFavorite, getFavoriteStatuses, removeFavorite } from "../../services/favoriteService";
import { addRecipeComment, getUserRecipeDetail, rateRecipe } from "../../services/recipeDetailService";
import { useAppTheme } from "../../styles/theme";
import { normalizeImageUri } from "../../utils/image";

export default function UserRecipeDetailScreen({
  recipeId,
  token,
  isGuest,
  onRequireAuth,
  onBack
}) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [shoppingModalVisible, setShoppingModalVisible] = useState(false);

  const authorName = useMemo(() => {
    if (!detail?.author) {
      return "";
    }

    return detail.author.firstName || detail.author.username || "Usuario";
  }, [detail]);
  const imageUri = normalizeImageUri(detail?.image);

  useEffect(() => {
    loadDetail();
  }, [recipeId, token, isGuest]);

  async function loadDetail() {
    try {
      setLoading(true);
      setError("");

      const [detailResponse, favoriteResponse] = await Promise.all([
        getUserRecipeDetail(recipeId, token),
        !isGuest && token
          ? getFavoriteStatuses(token, [recipeId])
          : Promise.resolve({ data: [] })
      ]);

      setDetail(detailResponse.data);
      setIsFavorite((favoriteResponse.data || []).includes(recipeId));
    } catch (requestError) {
      setError(requestError.message || "No se ha podido cargar la receta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavorite() {
    if (!token) {
      onRequireAuth?.();
      return;
    }

    if (isFavorite) {
      await removeFavorite(token, recipeId);
      setIsFavorite(false);
      return;
    }

    await addFavorite(token, { id: recipeId });
    setIsFavorite(true);
  }

  async function handleRate(value) {
    if (!token) {
      onRequireAuth?.();
      return;
    }

    try {
      const response = await rateRecipe(token, recipeId, value);
      setDetail(response.data);
    } catch (requestError) {
      Alert.alert("No se pudo guardar", requestError.message);
    }
  }

  function handleOpenShoppingList() {
    if (!token) {
      onRequireAuth?.();
      return;
    }

    setShoppingModalVisible(true);
  }

  async function handleAddComment() {
    if (!token) {
      onRequireAuth?.();
      return;
    }

    try {
      if (!commentText.trim()) {
        Alert.alert("Comentario vacío", "Escribe un comentario antes de enviarlo.");
        return;
      }

      setCommentSaving(true);
      const response = await addRecipeComment(token, recipeId, commentText.trim());
      setDetail(response.data);
      setCommentText("");
    } catch (requestError) {
      Alert.alert("No se pudo comentar", requestError.message);
    } finally {
      setCommentSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenShell>
        <RecipeDetailSkeleton />
      </ScreenShell>
    );
  }

  if (error || !detail) {
    return (
      <ScreenShell>
        <EmptyResultsState
          title="No hemos podido cargar la receta"
          description={error || "Inténtalo de nuevo dentro de unos instantes."}
        />
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
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant-outline" size={32} color={theme.colors.primaryStrong} />
            <Text style={styles.placeholderText}>Imagen no disponible</Text>
          </View>
        )}

        <View style={styles.heroBody}>
          <Text style={styles.title}>{detail.name}</Text>
          <Text style={styles.author}>Por {authorName}</Text>
          <Text style={styles.description}>
            {detail.description || "Receta de la comunidad lista para prepararla paso a paso."}
          </Text>

          <View style={styles.metaWrap}>
            {detail.category ? <MetaChip label={detail.category} theme={theme} /> : null}
            {detail.difficulty ? <MetaChip label={detail.difficulty} theme={theme} /> : null}
            {detail.servings ? <MetaChip label={`${detail.servings} personas`} theme={theme} /> : null}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {detail.ingredients.map((ingredient) => (
          <Text key={ingredient.id} style={styles.lineItem}>
            • {[ingredient.quantity, ingredient.unit, ingredient.ingredientName].filter(Boolean).join(" ")}
          </Text>
        ))}
      </View>

      <View style={styles.utilitySection}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        
        <View style={styles.utilityActions}>
          <Pressable style={styles.utilityButton} onPress={handleOpenShoppingList}>
            <Ionicons name="cart-outline" size={20} color={theme.colors.primaryStrong} />
            <Text style={styles.utilityButtonText}>Añadir a lista</Text>
          </Pressable>
          <Pressable style={styles.utilityButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#d35b73" : theme.colors.primaryStrong}
            />
            <Text style={styles.utilityButtonText}>
              {isFavorite ? "En favoritos" : "Guardar favorita"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preparación</Text>
        {detail.steps.map((step) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step.stepNumber}</Text>
            </View>
            <Text style={styles.stepText}>{step.instruction}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu valoración</Text>
        <View style={styles.ratingChooser}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => handleRate(value)}>
              <Ionicons
                name={value <= Number(detail.myRating || 0) ? "star" : "star-outline"}
                size={28}
                color={value <= Number(detail.myRating || 0) ? "#d8a83f" : theme.colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
        <Text style={styles.ratingSummary}>
          Media {Number(detail.averageRating || 0).toFixed(1)} con {detail.ratingsCount || 0} valoraciones
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comentarios</Text>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Escribe tu comentario"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.commentInput}
          multiline
        />
        <Pressable style={styles.primaryButton} onPress={handleAddComment}>
          {commentSaving ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Publicar comentario</Text>
          )}
        </Pressable>

        {detail.comments.length ? (
          detail.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentAuthor}>
                {comment.author.firstName || comment.author.username || "Usuario"}
              </Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Todavía no hay comentarios en esta receta.</Text>
        )}
      </View>

      <AddRecipeToShoppingListModal
        visible={shoppingModalVisible}
        token={token}
        recipe={detail}
        onClose={() => setShoppingModalVisible(false)}
      />
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
    centered: {
      paddingTop: 40,
      alignItems: "center"
    },
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
    author: {
      marginTop: 8,
      color: theme.colors.textSoft,
      fontStyle: "italic"
    },
    description: {
      marginTop: 12,
      color: theme.colors.textSoft,
      lineHeight: 22
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
    utilitySection: {
      marginTop: 18,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    utilityText: {
      marginTop: 10,
      color: theme.colors.textSoft,
      lineHeight: 21
    },
    utilityActions: {
      marginTop: 14,
      flexDirection: "row",
      gap: 10
    },
    utilityButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12
    },
    utilityButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800",
      textAlign: "center"
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
    },
    stepRow: {
      marginTop: 14,
      flexDirection: "row",
      gap: 12
    },
    stepBadge: {
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center"
    },
    stepBadgeText: {
      color: theme.colors.white,
      fontWeight: "900"
    },
    stepText: {
      flex: 1,
      color: theme.colors.textSoft,
      lineHeight: 22
    },
    ratingChooser: {
      marginTop: 14,
      flexDirection: "row",
      gap: 8
    },
    ratingSummary: {
      marginTop: 10,
      color: theme.colors.textSoft
    },
    commentInput: {
      marginTop: 14,
      minHeight: 96,
      textAlignVertical: "top",
      backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      padding: 14,
      color: theme.colors.text
    },
    primaryButton: {
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    commentCard: {
      marginTop: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    commentAuthor: {
      color: theme.colors.text,
      fontWeight: "800"
    },
    commentText: {
      marginTop: 8,
      color: theme.colors.textSoft,
      lineHeight: 21
    },
    emptyText: {
      marginTop: 12,
      color: theme.colors.textSoft
    }
  });
