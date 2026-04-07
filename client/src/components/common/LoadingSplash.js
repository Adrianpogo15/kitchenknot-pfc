import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import LogoMark from "./LogoMark";
import { useAppTheme } from "../../styles/theme";

export default function LoadingSplash() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const pulse = useRef(new Animated.Value(0.92)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, [pulse, shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 180]
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.heroCard, { transform: [{ scale: pulse }] }]}>
        <LogoMark />
        <Text style={styles.title}>Preparando tu cocina digital</Text>
        <Text style={styles.subtitle}>
          Cargando una experiencia limpia, elegante y lista para probar en tiempo real.
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressGlow, { transform: [{ translateX }] }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: theme.colors.background
  },
  heroCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 34,
    padding: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow
  },
  title: {
    marginTop: 28,
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 10,
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 23
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    overflow: "hidden",
    marginTop: 24
  },
  progressGlow: {
    width: 120,
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.primary
  }
});
