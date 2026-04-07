import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
  createShoppingList,
  getShoppingLists,
  importRecipeToShoppingList
} from "../../services/shoppingListService";
import { useAppTheme } from "../../styles/theme";

export default function AddRecipeToShoppingListModal({
  visible,
  token,
  recipe,
  onClose,
  onSuccess
}) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible || !token) {
      return;
    }

    loadLists();
  }, [visible, token]);

  async function loadLists() {
    try {
      setLoading(true);
      setError("");
      const response = await getShoppingLists(token);
      const nextLists = response.data || [];
      setLists(nextLists);

      if (nextLists.length) {
        setSelectedListId(nextLists[0].id);
        setCreateMode(false);
      } else {
        setSelectedListId("");
        setCreateMode(true);
      }
    } catch (requestError) {
      setError(requestError.message || "No se han podido cargar tus listas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    try {
      setSaving(true);
      setError("");

      if (createMode) {
        const cleanName = newListName.trim();

        if (!cleanName) {
          setError("Debes indicar el nombre de la nueva lista.");
          return;
        }

        const response = await importRecipeToShoppingList(token, {
          recipeId: recipe.id,
          newListName: cleanName
        });

        onSuccess?.(response.data);
        handleDismiss();
        return;
      }

      if (!selectedListId) {
        setError("Debes seleccionar una lista.");
        return;
      }

      const response = await importRecipeToShoppingList(token, {
        recipeId: recipe.id,
        shoppingListId: selectedListId
      });

      onSuccess?.(response.data);
      handleDismiss();
    } catch (requestError) {
      setError(requestError.message || "No se han podido añadir los ingredientes.");
    } finally {
      setSaving(false);
    }
  }

  function handleDismiss() {
    setError("");
    setNewListName("");
    setCreateMode(false);
    onClose?.();
  }

  async function handleCreateEmptyList() {
    try {
      const cleanName = newListName.trim();

      if (!cleanName) {
        setError("Debes indicar el nombre de la nueva lista.");
        return;
      }

      setSaving(true);
      setError("");
      await createShoppingList(token, { name: cleanName });
      setNewListName("");
      await loadLists();
    } catch (requestError) {
      setError(requestError.message || "No se ha podido crear la lista.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalWrap}>
          <KeyboardAwareScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalCard}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={24}
          >
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.eyebrow}>Lista de la compra</Text>
              <Text style={styles.title}>Añadir ingredientes</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {recipe?.name}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={handleDismiss}>
              <Ionicons name="close-outline" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Cargando listas disponibles...</Text>
            </View>
          ) : (
            <>
              <View style={styles.modeRow}>
                <Pressable
                  style={[styles.modeButton, !createMode && styles.modeButtonActive]}
                  onPress={() => setCreateMode(false)}
                >
                  <Text style={[styles.modeButtonText, !createMode && styles.modeButtonTextActive]}>
                    Usar una lista existente
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modeButton, createMode && styles.modeButtonActive]}
                  onPress={() => setCreateMode(true)}
                >
                  <Text style={[styles.modeButtonText, createMode && styles.modeButtonTextActive]}>
                    Crear una nueva
                  </Text>
                </Pressable>
              </View>

              {!createMode ? (
                <View style={styles.listChoices}>
                  {lists.length ? (
                    lists.map((list) => (
                      <Pressable
                        key={list.id}
                        style={[
                          styles.listChoice,
                          selectedListId === list.id && styles.listChoiceSelected
                        ]}
                        onPress={() => setSelectedListId(list.id)}
                      >
                        <View style={styles.listChoiceText}>
                          <Text style={styles.listChoiceName}>{list.name}</Text>
                          <Text style={styles.listChoiceMeta}>
                            {list.itemsCount || 0} ingredientes
                          </Text>
                        </View>
                        {selectedListId === list.id ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        ) : null}
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.helperText}>
                      Todavía no tienes listas creadas. Usa la opción de crear una nueva.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.createWrap}>
                  <Text style={styles.inputLabel}>Nombre de la lista</Text>
                  <TextInput
                    value={newListName}
                    onChangeText={setNewListName}
                    placeholder="Ejemplo: Compra semanal"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.input}
                  />
                  <Pressable
                    style={[styles.secondaryAction, saving && styles.buttonDisabled]}
                    onPress={handleCreateEmptyList}
                    disabled={saving}
                  >
                    <Text style={styles.secondaryActionText}>Crear solo la lista</Text>
                  </Pressable>
                </View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.footer}>
                <Pressable style={styles.cancelButton} onPress={handleDismiss} disabled={saving}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmButton, saving && styles.buttonDisabled]}
                  onPress={handleConfirm}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.confirmButtonText}>Añadir ingredientes</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: 18
    },
    modalWrap: {
      maxHeight: "78%"
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12
    },
    headerTextWrap: {
      flex: 1
    },
    eyebrow: {
      color: theme.colors.accentStrong,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.4
    },
    title: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      marginTop: 8
    },
    subtitle: {
      color: theme.colors.textSoft,
      marginTop: 8,
      lineHeight: 20
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    loadingWrap: {
      paddingVertical: 28,
      alignItems: "center",
      gap: 10
    },
    loadingText: {
      color: theme.colors.textSoft,
      fontWeight: "600"
    },
    modeRow: {
      marginTop: 18,
      flexDirection: "row",
      gap: 8
    },
    modeButton: {
      flex: 1,
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 10
    },
    modeButtonActive: {
      backgroundColor: theme.colors.primarySoft
    },
    modeButtonText: {
      color: theme.colors.textSoft,
      fontWeight: "700",
      textAlign: "center",
      fontSize: 13
    },
    modeButtonTextActive: {
      color: theme.colors.primaryStrong
    },
    listChoices: {
      marginTop: 16,
      gap: 10
    },
    listChoice: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14
    },
    listChoiceSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft
    },
    listChoiceText: {
      flex: 1,
      gap: 4
    },
    listChoiceName: {
      color: theme.colors.text,
      fontWeight: "800",
      fontSize: 15
    },
    listChoiceMeta: {
      color: theme.colors.textSoft,
      fontSize: 12
    },
    helperText: {
      marginTop: 14,
      color: theme.colors.textSoft,
      lineHeight: 20
    },
    createWrap: {
      marginTop: 16
    },
    inputLabel: {
      color: theme.colors.text,
      fontWeight: "800",
      marginBottom: 10
    },
    input: {
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.text
    },
    secondaryAction: {
      marginTop: 12,
      alignSelf: "flex-start",
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14
    },
    secondaryActionText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    errorText: {
      marginTop: 14,
      color: theme.colors.danger,
      fontWeight: "700"
    },
    footer: {
      marginTop: 24,
      marginBottom: 14,
      flexDirection: "row",
      gap: 10
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center"
    },
    cancelButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "800"
    },
    confirmButton: {
      flex: 1.3,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    confirmButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    buttonDisabled: {
      opacity: 0.72
    }
  });
