import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../styles/theme";

export default function EmptyResultsState({
  title = "No hemos encontrado resultados",
  description = "Prueba con otro término o cambia los filtros."
}) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulse }] }]}>
        <Ionicons name="search-outline" size={28} color={theme.colors.primaryStrong} />
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "flex-start",
      marginTop: 12
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: theme.isDark ? "#22302c" : theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    title: {
      marginTop: 14,
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "800"
    },
    description: {
      marginTop: 8,
      color: theme.colors.textSoft,
      lineHeight: 22
    }
  });
