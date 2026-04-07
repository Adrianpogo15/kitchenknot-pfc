import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import EmptyResultsState from "../../components/common/EmptyResultsState";
import ScreenShell from "../../components/common/ScreenShell";
import ShoppingListsSkeleton from "../../components/shopping/ShoppingListsSkeleton";
import {
  addShoppingListItem,
  createShoppingList,
  deleteShoppingList,
  deleteShoppingListItem,
  getShoppingListDetail,
  getShoppingLists,
  updateShoppingListItem
} from "../../services/shoppingListService";
import { useAppTheme } from "../../styles/theme";

const UNIT_OPTIONS = ["ud", "g", "kg", "ml", "l", "cda", "cdta", "taza", "paquete"];

export default function ShoppingListsScreen({ token, isGuest, onRequireAuth }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const scrollRef = useRef(null);
  const detailPositionRef = useRef(0);
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [savingIngredient, setSavingIngredient] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [createModalError, setCreateModalError] = useState("");
  const [ingredientModalError, setIngredientModalError] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientQuantity, setNewIngredientQuantity] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("ud");

  useEffect(() => {
    if (!isGuest && token) {
      loadLists();
    }
  }, [token, isGuest]);

  async function loadLists() {
    try {
      setLoading(true);
      setError("");
      const response = await getShoppingLists(token);
      const nextLists = response.data || [];
      setLists(nextLists);

      if (selectedListId) {
        const exists = nextLists.find((item) => item.id === selectedListId);
        if (!exists) {
          setSelectedListId("");
          setSelectedList(null);
        }
      }
    } catch (requestError) {
      setError(requestError.message || "No se han podido cargar tus listas.");
    } finally {
      setLoading(false);
    }
  }

  function updateListSummaryLocally(listId, nextItems) {
    const itemsCount = nextItems.length;
    const checkedItemsCount = nextItems.filter((item) => item.isChecked).length;

    setLists((current) =>
      current.map((list) =>
        list.id === listId ? { ...list, itemsCount, checkedItemsCount } : list
      )
    );
  }

  async function loadListDetail(listId, scrollToDetail = false) {
    try {
      setDetailLoading(true);
      setDetailError("");
      const response = await getShoppingListDetail(token, listId);
      setSelectedListId(listId);
      setSelectedList(response.data);

      if (scrollToDetail) {
        setTimeout(() => {
          const targetY = Math.max(detailPositionRef.current - 18, 0);
          if (typeof scrollRef.current?.scrollToPosition === "function") {
            scrollRef.current.scrollToPosition(0, targetY, true);
            return;
          }
          scrollRef.current?.scrollTo?.({
            y: targetY,
            animated: true
          });
        }, 120);
      }
    } catch (requestError) {
      setDetailError(requestError.message || "No se ha podido cargar el detalle de la lista.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateList() {
    try {
      const cleanName = newListName.trim();

      if (!cleanName || creatingList) {
        if (!cleanName) {
          setCreateModalError("Debes indicar el nombre de la nueva lista.");
        }
        return;
      }

      setCreatingList(true);
      setError("");
      setCreateModalError("");
      const response = await createShoppingList(token, { name: cleanName });
      setCreateModalVisible(false);
      setNewListName("");
      await loadLists();
      await loadListDetail(response.data.id, true);
    } catch (requestError) {
      setCreateModalError(requestError.message || "No se ha podido crear la lista.");
    } finally {
      setCreatingList(false);
    }
  }

  function handleConfirmDelete(list) {
    Alert.alert("Eliminar lista", `¿Seguro que quieres borrar la lista "${list.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => handleDeleteList(list.id)
      }
    ]);
  }

  async function handleDeleteList(listId) {
    try {
      await deleteShoppingList(token, listId);
      if (selectedListId === listId) {
        setSelectedListId("");
        setSelectedList(null);
      }
      await loadLists();
    } catch (requestError) {
      setError(requestError.message || "No se ha podido eliminar la lista.");
    }
  }

  async function handleToggleItem(item) {
    try {
      const nextItems = (selectedList?.items || []).map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, isChecked: !currentItem.isChecked } : currentItem
      );

      setSelectedList((current) => (current ? { ...current, items: nextItems } : current));
      updateListSummaryLocally(selectedListId, nextItems);

      await updateShoppingListItem(token, selectedListId, item.id, {
        isChecked: !item.isChecked
      });
    } catch (requestError) {
      await loadListDetail(selectedListId);
      await loadLists();
      setDetailError(requestError.message || "No se ha podido actualizar el ingrediente.");
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await deleteShoppingListItem(token, selectedListId, itemId);
      const nextItems = (selectedList?.items || []).filter((item) => item.id !== itemId);
      setSelectedList((current) => (current ? { ...current, items: nextItems } : current));
      updateListSummaryLocally(selectedListId, nextItems);
    } catch (requestError) {
      setDetailError(requestError.message || "No se ha podido eliminar el ingrediente.");
    }
  }

  async function handleAddItem() {
    try {
      if (!newIngredientName.trim() || savingIngredient) {
        if (!newIngredientName.trim()) {
          setIngredientModalError("Debes indicar el nombre del ingrediente.");
        }
        return;
      }

      setSavingIngredient(true);
      setIngredientModalError("");
      const response = await addShoppingListItem(token, selectedListId, {
        ingredientName: newIngredientName.trim(),
        quantity: newIngredientQuantity.trim() || null,
        unit: newIngredientUnit || null
      });

      const nextItems = [...(selectedList?.items || []), response.data];
      setSelectedList((current) => (current ? { ...current, items: nextItems } : current));
      updateListSummaryLocally(selectedListId, nextItems);
      setNewIngredientName("");
      setNewIngredientQuantity("");
      setNewIngredientUnit("ud");
      setDetailError("");
      setIngredientModalVisible(false);
    } catch (requestError) {
      setIngredientModalError(requestError.message || "No se ha podido añadir el ingrediente.");
    } finally {
      setSavingIngredient(false);
    }
  }

  if (isGuest) {
    return (
      <ScreenShell>
        <View style={styles.guestCard}>
          <Text style={styles.title}>Tus listas necesitan una cuenta</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para crear listas, organizar ingredientes y preparar tu compra.
          </Text>
          <Pressable style={styles.primaryButton} onPress={onRequireAuth}>
            <Text style={styles.primaryButtonText}>Ir al acceso</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell ref={scrollRef}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Compras</Text>
        <Text style={styles.title}>Listas de la compra</Text>
        <Text style={styles.subtitle}>
          Gestiona tus carritos de compra.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tus listas</Text>
        <Pressable
          style={styles.createButton}
          onPress={() => {
            setCreateModalError("");
            setCreateModalVisible(true);
          }}
        >
          <Ionicons name="add-outline" size={18} color={theme.colors.white} />
          <Text style={styles.createButtonText}>Nueva lista</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ShoppingListsSkeleton />
      ) : null}

      {!loading && !lists.length ? (
        <EmptyResultsState
          title="Todavía no tienes listas"
          description="Crea tu primera lista de la compra para empezar a organizar ingredientes."
        />
      ) : null}

      {lists.map((list) => (
        <Pressable
          key={list.id}
          style={[
            styles.listCard,
            selectedListId === list.id && styles.listCardSelected
          ]}
          onPress={() => loadListDetail(list.id, true)}
        >
          <View style={styles.listCardTop}>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.listMeta}>
                {list.checkedItemsCount || 0}/{list.itemsCount || 0} completados
              </Text>
            </View>
            <Pressable
              style={styles.deleteButton}
              onPress={(event) => {
                event.stopPropagation?.();
                handleConfirmDelete(list);
              }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            </Pressable>
          </View>
        </Pressable>
      ))}

      {selectedListId ? (
        <View
          style={styles.detailSection}
          onLayout={(event) => {
            detailPositionRef.current = event.nativeEvent.layout.y;
          }}
        >
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderText}>
              <Text style={styles.sectionTitle}>Detalle de la lista</Text>
              <Text style={styles.detailName}>{selectedList?.name || "Lista seleccionada"}</Text>
            </View>
            <View style={styles.detailHeaderActions}>
                <Pressable
                  style={styles.addIconButton}
                  onPress={() => {
                    setIngredientModalError("");
                    setIngredientModalVisible(true);
                  }}
                >
                <Ionicons name="add-outline" size={20} color={theme.colors.white} />
              </Pressable>
              <Pressable
                style={styles.closeDetailButton}
                onPress={() => {
                  setSelectedListId("");
                  setSelectedList(null);
                  setDetailError("");
                }}
              >
                <Ionicons name="close-outline" size={20} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          {detailError ? <Text style={styles.errorText}>{detailError}</Text> : null}

          {detailLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null}

          {selectedList?.items?.length ? (
            selectedList.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Pressable style={styles.checkButton} onPress={() => handleToggleItem(item)}>
                  <Ionicons
                    name={item.isChecked ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={item.isChecked ? theme.colors.primary : theme.colors.textMuted}
                  />
                </Pressable>
                <View style={styles.itemTextWrap}>
                  <Text style={[styles.itemName, item.isChecked && styles.itemNameChecked]}>
                    {item.ingredientName}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {[item.quantity, item.unit].filter(Boolean).join(" ")}
                  </Text>
                </View>
                <Pressable style={styles.deleteButton} onPress={() => handleDeleteItem(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                </Pressable>
              </View>
            ))
          ) : !detailLoading ? (
            <EmptyResultsState
              title="La lista está vacía"
              description="Añade ingredientes manualmente o importa los de una receta."
            />
          ) : null}
        </View>
      ) : null}

      <StyledModal
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
        theme={theme}
      >
        <Text style={styles.modalTitle}>Nueva lista de la compra</Text>
        <Text style={styles.modalSubtitle}>
          Ponle un nombre claro para encontrarla rápido cuando la necesites.
        </Text>
        <TextInput
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Nombre de la lista"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        {createModalError ? <Text style={styles.errorText}>{createModalError}</Text> : null}
        <View style={styles.modalActions}>
          <Pressable
            style={styles.secondaryButtonWide}
            onPress={() => {
              setCreateModalError("");
              setCreateModalVisible(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButtonWide, creatingList && styles.buttonDisabled]}
            onPress={handleCreateList}
            disabled={creatingList}
          >
            {creatingList ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Crear lista</Text>
            )}
          </Pressable>
        </View>
      </StyledModal>

      <StyledModal
        visible={ingredientModalVisible}
        onRequestClose={() => setIngredientModalVisible(false)}
        theme={theme}
      >
        <Text style={styles.modalTitle}>Añadir ingrediente</Text>
        <Text style={styles.modalSubtitle}>
          Añade un ingrediente manualmente y elige una unidad habitual.
        </Text>
        <TextInput
          value={newIngredientName}
          onChangeText={setNewIngredientName}
          placeholder="Nombre del ingrediente"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        <View style={styles.inlineInputs}>
          <TextInput
            value={newIngredientQuantity}
            onChangeText={setNewIngredientQuantity}
            placeholder="Cantidad"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.inlineInput]}
          />
        </View>

        <Text style={styles.unitsTitle}>Unidad</Text>
        <View style={styles.unitsWrap}>
          {UNIT_OPTIONS.map((unit) => (
            <Pressable
              key={unit}
              style={[styles.unitChip, newIngredientUnit === unit && styles.unitChipSelected]}
              onPress={() => setNewIngredientUnit(unit)}
            >
              <Text
                style={[
                  styles.unitChipText,
                  newIngredientUnit === unit && styles.unitChipTextSelected
                ]}
              >
                {unit}
              </Text>
            </Pressable>
          ))}
        </View>
        {ingredientModalError ? <Text style={styles.errorText}>{ingredientModalError}</Text> : null}

        <View style={styles.modalActions}>
          <Pressable
            style={styles.secondaryButtonWide}
            onPress={() => {
              setIngredientModalError("");
              setIngredientModalVisible(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButtonWide, savingIngredient && styles.buttonDisabled]}
            onPress={handleAddItem}
            disabled={savingIngredient}
          >
            {savingIngredient ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Guardar ingrediente</Text>
            )}
          </Pressable>
        </View>
      </StyledModal>
    </ScreenShell>
  );
}

function StyledModal({ visible, onRequestClose, theme, children }) {
  const styles = createStyles(theme);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCardWrap}>
          <KeyboardAwareScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalCard}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={24}
          >
            {children}
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
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
    sectionHeader: {
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
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 14
    },
    createButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    loadingWrap: {
      marginTop: 24,
      alignItems: "center"
    },
    listCard: {
      marginTop: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    listCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.card
    },
    listCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14
    },
    listInfo: {
      flex: 1
    },
    listName: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800"
    },
    listMeta: {
      color: theme.colors.textSoft,
      marginTop: 6
    },
    detailSection: {
      marginTop: 22,
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    detailHeaderText: {
      flex: 1
    },
    detailHeaderActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    detailName: {
      marginTop: 6,
      color: theme.colors.textSoft,
      fontWeight: "700"
    },
    closeDetailButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    addIconButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center"
    },
    itemRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    checkButton: {
      width: 28,
      alignItems: "center"
    },
    itemTextWrap: {
      flex: 1
    },
    itemName: {
      color: theme.colors.text,
      fontWeight: "800"
    },
    itemNameChecked: {
      color: theme.colors.textMuted,
      textDecorationLine: "line-through"
    },
    itemMeta: {
      color: theme.colors.textSoft,
      marginTop: 4
    },
    input: {
      marginTop: 14,
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.text
    },
    inlineInputs: {
      marginTop: 10,
      flexDirection: "row",
      gap: 10
    },
    inlineInput: {
      flex: 1
    },
    primaryButton: {
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center"
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
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.control,
      alignItems: "center",
      justifyContent: "center"
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: 18
    },
    modalCardWrap: {
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
    modalTitle: {
      color: theme.colors.text,
      fontWeight: "900",
      fontSize: 22
    },
    modalSubtitle: {
      color: theme.colors.textSoft,
      marginTop: 8,
      lineHeight: 21
    },
    modalActions: {
      marginTop: 22,
      marginBottom: 14,
      flexDirection: "row",
      gap: 10
    },
    unitsTitle: {
      marginTop: 16,
      color: theme.colors.text,
      fontWeight: "800"
    },
    unitsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10
    },
    unitChip: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9
    },
    unitChipSelected: {
      backgroundColor: theme.colors.primary
    },
    unitChipText: {
      color: theme.colors.primaryStrong,
      fontWeight: "700"
    },
    unitChipTextSelected: {
      color: theme.colors.white
    },
    buttonDisabled: {
      opacity: 0.7
    },
    errorText: {
      marginTop: 12,
      color: theme.colors.danger,
      fontWeight: "700"
    }
  });
