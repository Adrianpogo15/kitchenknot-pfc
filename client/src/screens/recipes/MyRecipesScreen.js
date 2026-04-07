import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";

import EmptyResultsState from "../../components/common/EmptyResultsState";
import ScreenShell from "../../components/common/ScreenShell";
import SkeletonBlock from "../../components/common/SkeletonBlock";
import { getUserRecipeDetail } from "../../services/recipeDetailService";
import {
  createUserRecipe,
  deleteUserRecipe,
  getMyRecipes,
  updateUserRecipe
} from "../../services/userRecipeService";
import { useAppTheme } from "../../styles/theme";

const DIFFICULTY_OPTIONS = ["facil", "media", "dificil"];
const CATEGORY_OPTIONS = ["Entrante", "Principal", "Postre", "Desayuno", "Cena", "Snack"];
const UNIT_OPTIONS = ["ud", "g", "kg", "ml", "l", "cda", "cdta", "taza", "paquete"];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Principal",
  difficulty: "facil",
  preparationTimeMinutes: "",
  servings: "",
  imageUrl: "",
  imagePreview: "",
  imageUpload: null,
  removeImage: false,
  isPublic: true,
  ingredients: [{ ingredientName: "", quantity: "", unit: "" }],
  steps: [{ instruction: "" }]
};

export default function MyRecipesScreen({ token, isGuest, onRequireAuth, onOpenRecipe }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [recipeModalMode, setRecipeModalMode] = useState("create");
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [loadingModalRecipe, setLoadingModalRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadRecipes();
  }, [token, isGuest]);

  const modalTitle = useMemo(
    () => (recipeModalMode === "create" ? "Nueva receta" : "Editar receta"),
    [recipeModalMode]
  );

  async function loadRecipes() {
    if (isGuest || !token) {
      setRecipes([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await getMyRecipes(token, { page: 1, pageSize: 10 });
      setRecipes(response.data || []);
    } catch (requestError) {
      setRecipes([]);
      setError(requestError.message || "No se han podido cargar tus recetas.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setRecipeModalMode("create");
    setEditingRecipeId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setRecipeModalVisible(true);
  }

  async function openEditModal(recipe) {
    try {
      setLoadingModalRecipe(true);
      setEditingRecipeId(recipe.id);
      const response = await getUserRecipeDetail(recipe.id, token);
      const detail = response.data;

      setRecipeModalMode("edit");
      setForm({
        title: detail.name || "",
        description: detail.description || "",
        category: detail.category || "Principal",
        difficulty: detail.difficulty || "facil",
        preparationTimeMinutes: detail.preparationTimeMinutes
          ? String(detail.preparationTimeMinutes)
          : "",
        servings: detail.servings ? String(detail.servings) : "",
        imageUrl: detail.image || "",
        imagePreview: detail.image || "",
        imageUpload: null,
        removeImage: false,
        isPublic: detail.isPublic !== false,
        ingredients:
          detail.ingredients?.length
            ? detail.ingredients.map((ingredient) => ({
                ingredientName: ingredient.ingredientName || "",
                quantity: ingredient.quantity ? String(ingredient.quantity) : "",
                unit: ingredient.unit || ""
              }))
            : [{ ingredientName: "", quantity: "", unit: "" }],
        steps:
          detail.steps?.length
            ? detail.steps.map((step) => ({
                instruction: step.instruction || ""
              }))
            : [{ instruction: "" }]
      });
      setFormError("");
      setRecipeModalVisible(true);
    } catch (requestError) {
      setError(requestError.message || "No se ha podido cargar la receta para editar.");
    } finally {
      setLoadingModalRecipe(false);
    }
  }

  function closeRecipeModal() {
    if (savingRecipe) {
      return;
    }

    setRecipeModalVisible(false);
    setFormError("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateIngredient(index, field, value) {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  }

  function updateStep(index, value) {
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, instruction: value } : step
      )
    }));
  }

  function addIngredientRow() {
    setForm((current) => ({
      ...current,
      ingredients: [...current.ingredients, { ingredientName: "", quantity: "", unit: "" }]
    }));
  }

  function moveStep(index, direction) {
    setForm((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.steps.length) {
        return current;
      }

      const nextSteps = [...current.steps];
      const temp = nextSteps[index];
      nextSteps[index] = nextSteps[nextIndex];
      nextSteps[nextIndex] = temp;

      return {
        ...current,
        steps: nextSteps
      };
    });
  }

  function removeIngredientRow(index) {
    setForm((current) => ({
      ...current,
      ingredients:
        current.ingredients.length === 1
          ? current.ingredients
          : current.ingredients.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  function addStepRow() {
    setForm((current) => ({
      ...current,
      steps: [...current.steps, { instruction: "" }]
    }));
  }

  function removeStepRow(index) {
    setForm((current) => ({
      ...current,
      steps:
        current.steps.length === 1
          ? current.steps
          : current.steps.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  function buildPayload() {
    return {
      title: form.title,
      description: form.description,
      category: form.category,
      difficulty: form.difficulty,
      preparationTimeMinutes: form.preparationTimeMinutes,
      servings: form.servings,
      imageUrl: form.imageUrl,
      imageUpload: form.imageUpload,
      removeImage: form.removeImage,
      isPublic: form.isPublic,
      ingredients: form.ingredients,
      steps: form.steps
    };
  }

  async function handleSaveRecipe() {
    try {
      setSavingRecipe(true);
      setFormError("");

      const payload = buildPayload();

      if (recipeModalMode === "create") {
        await createUserRecipe(token, payload);
      } else {
        await updateUserRecipe(token, editingRecipeId, payload);
      }

      setRecipeModalVisible(false);
      await loadRecipes();
    } catch (requestError) {
      setFormError(requestError.message || "No se ha podido guardar la receta.");
    } finally {
      setSavingRecipe(false);
    }
  }

  function confirmDeleteRecipe(recipe) {
    Alert.alert("Eliminar receta", `¿Seguro que quieres eliminar "${recipe.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUserRecipe(token, recipe.id);
            await loadRecipes();
          } catch (requestError) {
            setError(requestError.message || "No se ha podido eliminar la receta.");
          }
        }
      }
    ]);
  }

  if (isGuest) {
    return (
      <ScreenShell>
        <View style={styles.guestCard}>
          <Text style={styles.title}>Tus recetas necesitan una cuenta</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para crear, editar y organizar tus recetas personales.
          </Text>
          <Pressable style={styles.primaryButton} onPress={onRequireAuth}>
            <Text style={styles.primaryButtonText}>Ir al acceso</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Creación propia</Text>
        <Text style={styles.title}>Mis recetas</Text>
        <Text style={styles.subtitle}>
          Gestiona tus recetas personales.
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Tus recetas</Text>
        <Pressable style={styles.primaryButtonCompact} onPress={openCreateModal}>
          <Ionicons name="add-outline" size={18} color={theme.colors.white} />
          <Text style={styles.primaryButtonText}>Nueva receta</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.manageCard}>
              <SkeletonBlock height={24} width="58%" />
              <SkeletonBlock height={16} width="36%" style={styles.skeletonGap} />
              <View style={styles.manageActions}>
                <SkeletonBlock height={42} width={94} />
                <SkeletonBlock height={42} width={82} />
                <SkeletonBlock height={42} width={82} />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {!loading && !recipes.length ? (
        <EmptyResultsState
          title="Todavía no has creado recetas"
          description="Empieza creando tu primera receta y verás aquí todas tus creaciones."
        />
      ) : null}

      {recipes.map((recipe) => (
        <View key={recipe.id} style={styles.manageCard}>
          <View style={styles.recipeCardTop}>
            {recipe.image ? (
              <Image source={{ uri: recipe.image }} style={styles.recipeThumb} />
            ) : (
              <View style={styles.recipeThumbPlaceholder}>
                <Ionicons name="image-outline" size={20} color={theme.colors.primaryStrong} />
              </View>
            )}
            <View style={styles.recipeCardText}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <Text style={styles.recipeMeta}>
                {[recipe.category, recipe.difficulty, recipe.servings ? `${recipe.servings} personas` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          </View>

          <View style={styles.manageActions}>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenRecipe?.(recipe)}>
              <Text style={styles.secondaryButtonText}>Ver detalle</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, loadingModalRecipe && styles.buttonDisabled]}
              onPress={() => openEditModal(recipe)}
              disabled={loadingModalRecipe}
            >
              <Text style={styles.secondaryButtonText}>
                {loadingModalRecipe && editingRecipeId === recipe.id ? "Cargando..." : "Editar"}
              </Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={() => confirmDeleteRecipe(recipe)}>
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <RecipeFormModal
        visible={recipeModalVisible}
        title={modalTitle}
        form={form}
        onClose={closeRecipeModal}
        onChangeField={updateField}
        onChangeIngredient={updateIngredient}
        onRemoveIngredient={removeIngredientRow}
        onAddIngredient={addIngredientRow}
        unitOptions={UNIT_OPTIONS}
        onChangeStep={updateStep}
        onMoveStep={moveStep}
        onRemoveStep={removeStepRow}
        onAddStep={addStepRow}
        onSave={handleSaveRecipe}
        onPickImage={async () => {
          try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
              Alert.alert(
                "Permiso necesario",
                "Necesitamos acceso a tu galería para poder añadir una imagen a la receta."
              );
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.4,
              base64: true
            });

            if (result.canceled || !result.assets?.[0]) {
              return;
            }

            const asset = result.assets[0];

            setForm((current) => ({
              ...current,
              imagePreview: asset.uri,
              imageUpload: {
                base64: asset.base64,
                mimeType: asset.mimeType || "image/jpeg"
              },
              removeImage: false
            }));
          } catch (_error) {
            Alert.alert("No se pudo abrir la galería", "Inténtalo de nuevo desde tu dispositivo.");
          }
        }}
        onRemoveImage={() =>
          setForm((current) => ({
            ...current,
            imagePreview: "",
            imageUrl: "",
            imageUpload: null,
            removeImage: true
          }))
        }
        saving={savingRecipe}
        error={formError}
        theme={theme}
      />
    </ScreenShell>
  );
}

function RecipeFormModal({
  visible,
  title,
  form,
  onClose,
  onChangeField,
  onChangeIngredient,
  onRemoveIngredient,
  onAddIngredient,
  unitOptions,
  onChangeStep,
  onMoveStep,
  onRemoveStep,
  onAddStep,
  onSave,
  onPickImage,
  onRemoveImage,
  saving,
  error,
  theme
}) {
  const styles = createStyles(theme);
  const scrollRef = useRef(null);
  const stepsSectionY = useRef(0);

  function handleAddIngredient() {
    onAddIngredient();
    setTimeout(() => {
      const targetY = Math.max(stepsSectionY.current - 120, 0);
      if (typeof scrollRef.current?.scrollToPosition === "function") {
        scrollRef.current.scrollToPosition(0, targetY, true);
        return;
      }
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 120);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalWrap}>
          <KeyboardAwareScrollView
            ref={scrollRef}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalCard}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={24}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-outline" size={22} color={theme.colors.text} />
              </Pressable>
            </View>

            <TextInput
              value={form.title}
              onChangeText={(value) => onChangeField("title", value)}
              placeholder="Título de la receta"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <TextInput
              value={form.description}
              onChangeText={(value) => onChangeField("description", value)}
              placeholder="Descripción"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.textArea]}
              multiline
            />

            <Text style={styles.groupTitle}>Categoría</Text>
            <View style={styles.chipsWrap}>
              {CATEGORY_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={form.category === option}
                  onPress={() => onChangeField("category", option)}
                  theme={theme}
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Dificultad</Text>
            <View style={styles.chipsWrap}>
              {DIFFICULTY_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={form.difficulty === option}
                  onPress={() => onChangeField("difficulty", option)}
                  theme={theme}
                />
              ))}
            </View>

            <View style={styles.inlineRow}>
              <TextInput
                value={form.preparationTimeMinutes}
                onChangeText={(value) => onChangeField("preparationTimeMinutes", value)}
                placeholder="Minutos"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.inlineInput]}
                keyboardType="numeric"
              />
              <TextInput
                value={form.servings}
                onChangeText={(value) => onChangeField("servings", value)}
                placeholder="Comensales"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.inlineInput]}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.imageManager}>
              {form.imagePreview ? (
                <Image source={{ uri: form.imagePreview }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color={theme.colors.primaryStrong} />
                  <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
                </View>
              )}
              <View style={styles.imageActions}>
                <Pressable style={styles.secondaryButton} onPress={onPickImage}>
                  <Text style={styles.secondaryButtonText}>
                    {form.imagePreview ? "Cambiar imagen" : "Añadir imagen"}
                  </Text>
                </Pressable>
                {form.imagePreview ? (
                  <Pressable style={styles.deleteButton} onPress={onRemoveImage}>
                    <Text style={styles.deleteButtonText}>Quitar imagen</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Visible para otros usuarios</Text>
              <Switch
                value={form.isPublic}
                onValueChange={(value) => onChangeField("isPublic", value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <SectionEditor
              title="Ingredientes"
              onAdd={handleAddIngredient}
              addLabel="Añadir ingrediente"
              theme={theme}
            >
              {form.ingredients.map((ingredient, index) => (
                <View key={`ingredient-${index}`} style={styles.dynamicCard}>
                  <TextInput
                    value={ingredient.ingredientName}
                    onChangeText={(value) => onChangeIngredient(index, "ingredientName", value)}
                    placeholder="Ingrediente"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.input}
                  />
                  <View style={styles.inlineRow}>
                    <TextInput
                      value={ingredient.quantity}
                      onChangeText={(value) => onChangeIngredient(index, "quantity", value)}
                      placeholder="Cantidad"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[styles.input, styles.inlineInput]}
                    />
                  </View>
                  <Text style={styles.subGroupTitle}>Unidad</Text>
                  <View style={styles.chipsWrap}>
                    {unitOptions.map((option) => (
                      <ChoiceChip
                        key={`${index}-${option}`}
                        label={option}
                        active={ingredient.unit === option}
                        onPress={() => onChangeIngredient(index, "unit", option)}
                        theme={theme}
                      />
                    ))}
                  </View>
                  <Pressable style={styles.removeButton} onPress={() => onRemoveIngredient(index)}>
                    <Text style={styles.removeButtonText}>Quitar</Text>
                  </Pressable>
                </View>
              ))}
            </SectionEditor>

            <SectionEditor
              title="Pasos"
              onAdd={onAddStep}
              addLabel="Añadir paso"
              theme={theme}
              onLayout={(event) => {
                stepsSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              {form.steps.map((step, index) => (
                <View key={`step-${index}`} style={styles.dynamicCard}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>Paso {index + 1}</Text>
                    <View style={styles.stepActions}>
                      <Pressable
                        style={[
                          styles.stepMoveButton,
                          index === 0 && styles.stepMoveButtonDisabled
                        ]}
                        onPress={() => onMoveStep(index, -1)}
                        disabled={index === 0}
                      >
                        <Ionicons
                          name="arrow-up-outline"
                          size={16}
                          color={index === 0 ? theme.colors.textMuted : theme.colors.primaryStrong}
                        />
                      </Pressable>
                      <Pressable
                        style={[
                          styles.stepMoveButton,
                          index === form.steps.length - 1 && styles.stepMoveButtonDisabled
                        ]}
                        onPress={() => onMoveStep(index, 1)}
                        disabled={index === form.steps.length - 1}
                      >
                        <Ionicons
                          name="arrow-down-outline"
                          size={16}
                          color={
                            index === form.steps.length - 1
                              ? theme.colors.textMuted
                              : theme.colors.primaryStrong
                          }
                        />
                      </Pressable>
                    </View>
                  </View>
                  <TextInput
                    value={step.instruction}
                    onChangeText={(value) => onChangeStep(index, value)}
                    placeholder="Describe este paso"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.input, styles.textArea]}
                    multiline
                  />
                  <Pressable style={styles.removeButton} onPress={() => onRemoveStep(index)}>
                    <Text style={styles.removeButtonText}>Quitar</Text>
                  </Pressable>
                </View>
              ))}
            </SectionEditor>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButtonWide} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButtonWide, saving && styles.buttonDisabled]}
                onPress={onSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar receta</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SectionEditor({ title, addLabel, onAdd, children, theme, onLayout }) {
  const styles = createStyles(theme);

  return (
    <View style={styles.editorSection} onLayout={onLayout}>
      <View style={styles.editorHeader}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Pressable style={styles.addMiniButton} onPress={onAdd}>
          <Ionicons name="add-outline" size={16} color={theme.colors.white} />
          <Text style={styles.addMiniButtonText}>{addLabel}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function ChoiceChip({ label, active, onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={[styles.choiceChip, active && styles.choiceChipActive]} onPress={onPress}>
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
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
    guestCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 30,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    headerRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900"
    },
    skeletonWrap: {
      marginTop: 10
    },
    skeletonGap: {
      marginTop: 8
    },
    manageCard: {
      marginTop: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    recipeCardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12
    },
    recipeCardText: {
      flex: 1
    },
    recipeThumb: {
      width: 58,
      height: 58,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceStrong
    },
    recipeThumbPlaceholder: {
      width: 58,
      height: 58,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    recipeName: {
      color: theme.colors.text,
      fontSize: 19,
      fontWeight: "800"
    },
    recipeMeta: {
      color: theme.colors.textSoft,
      marginTop: 8,
      lineHeight: 20
    },
    manageActions: {
      marginTop: 14,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    primaryButton: {
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    primaryButtonCompact: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 14
    },
    primaryButtonWide: {
      flex: 1,
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
    secondaryButton: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 16,
      paddingVertical: 11,
      paddingHorizontal: 14
    },
    secondaryButtonWide: {
      flex: 1,
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    secondaryButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    deleteButton: {
      backgroundColor: theme.colors.control,
      borderRadius: 16,
      paddingVertical: 11,
      paddingHorizontal: 14
    },
    deleteButtonText: {
      color: theme.colors.danger,
      fontWeight: "800"
    },
    errorText: {
      marginTop: 12,
      color: theme.colors.danger,
      fontWeight: "700"
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: 18
    },
    modalWrap: {
      maxHeight: "84%"
    },
    modalScroll: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    modalCard: {
      padding: 18,
      paddingBottom: 30
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900"
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    input: {
      marginTop: 12,
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.text
    },
    imageManager: {
      marginTop: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    imagePreview: {
      width: "100%",
      height: 180,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceStrong
    },
    imagePlaceholder: {
      width: "100%",
      height: 180,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center",
      gap: 10
    },
    imagePlaceholderText: {
      color: theme.colors.textSoft,
      fontWeight: "700"
    },
    imageActions: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    textArea: {
      minHeight: 96,
      textAlignVertical: "top"
    },
    inlineRow: {
      flexDirection: "row",
      gap: 10
    },
    inlineInput: {
      flex: 1
    },
    groupTitle: {
      marginTop: 18,
      color: theme.colors.text,
      fontWeight: "900",
      fontSize: 16
    },
    subGroupTitle: {
      marginTop: 14,
      color: theme.colors.textSoft,
      fontWeight: "800",
      fontSize: 13
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10
    },
    choiceChip: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9
    },
    choiceChipActive: {
      backgroundColor: theme.colors.primary
    },
    choiceChipText: {
      color: theme.colors.primaryStrong,
      fontWeight: "700"
    },
    choiceChipTextActive: {
      color: theme.colors.white
    },
    switchRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    switchLabel: {
      flex: 1,
      color: theme.colors.text,
      fontWeight: "700"
    },
    editorSection: {
      marginTop: 6
    },
    editorHeader: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    addMiniButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12
    },
    addMiniButtonText: {
      color: theme.colors.white,
      fontWeight: "800",
      fontSize: 12
    },
    dynamicCard: {
      marginTop: 12,
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    removeButton: {
      alignSelf: "flex-start",
      marginTop: 12,
      backgroundColor: theme.colors.control,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12
    },
    removeButtonText: {
      color: theme.colors.danger,
      fontWeight: "800"
    },
    stepTitle: {
      color: theme.colors.text,
      fontWeight: "800"
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    },
    stepActions: {
      flexDirection: "row",
      gap: 8
    },
    stepMoveButton: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    stepMoveButtonDisabled: {
      opacity: 0.45
    },
    modalActions: {
      marginTop: 28,
      marginBottom: 18,
      flexDirection: "row",
      gap: 10
    },
    buttonDisabled: {
      opacity: 0.72
    }
  });
