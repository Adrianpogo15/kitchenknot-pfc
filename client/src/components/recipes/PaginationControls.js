import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../styles/theme";

export default function PaginationControls({ page, totalPages, onPrevious, onNext, disabled }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.pagination}>
      <Pressable
        style={[styles.paginationButton, (page === 1 || disabled) && styles.paginationButtonDisabled]}
        onPress={onPrevious}
        disabled={page === 1 || disabled}
      >
        <Text style={styles.paginationButtonText}>Anterior</Text>
      </Pressable>

      <Text style={styles.paginationText}>
        {page} / {Math.max(totalPages, 1)}
      </Text>

      <Pressable
        style={[
          styles.paginationButton,
          (page >= totalPages || disabled) && styles.paginationButtonDisabled
        ]}
        onPress={onNext}
        disabled={page >= totalPages || disabled}
      >
        <Text style={styles.paginationButtonText}>Siguiente</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    pagination: {
      marginTop: 18,
      marginBottom: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    paginationButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 13,
      alignItems: "center"
    },
    paginationButtonDisabled: {
      opacity: 0.45
    },
    paginationButtonText: {
      color: theme.colors.white,
      fontWeight: "800"
    },
    paginationText: {
      color: theme.colors.text,
      fontWeight: "800",
      minWidth: 70,
      textAlign: "center"
    }
  });
