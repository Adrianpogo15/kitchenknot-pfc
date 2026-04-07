import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useAppTheme } from "../../styles/theme";

export default function SkeletonBlock({ height = 16, width = "100%", style }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 800,
          useNativeDriver: true
        })
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          height,
          width,
          opacity
        },
        style
      ]}
    />
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    block: {
      borderRadius: 12,
      backgroundColor: theme.isDark ? "#2b3b36" : "#e7e1d1"
    }
  });
