import React from "react";
import { StyleSheet, View } from "react-native";

import SkeletonBlock from "../common/SkeletonBlock";

export default function RecipeDetailSkeleton() {
  return (
    <View>
      <SkeletonBlock height={44} width={120} />

      <View style={styles.hero}>
        <SkeletonBlock height={220} width="100%" style={styles.heroImage} />
        <View style={styles.heroBody}>
          <SkeletonBlock height={30} width="78%" />
          <SkeletonBlock height={18} width="34%" style={styles.spaced} />
          <SkeletonBlock height={16} width="100%" style={styles.spaced} />
          <SkeletonBlock height={16} width="88%" style={styles.spacedSmall} />
        </View>
      </View>

      {[1, 2, 3].map((section) => (
        <View key={section} style={styles.section}>
          <SkeletonBlock height={24} width="42%" />
          <SkeletonBlock height={16} width="100%" style={styles.spaced} />
          <SkeletonBlock height={16} width="93%" style={styles.spacedSmall} />
          <SkeletonBlock height={16} width="86%" style={styles.spacedSmall} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 12
  },
  heroImage: {
    borderRadius: 28
  },
  heroBody: {
    marginTop: 14
  },
  section: {
    marginTop: 18
  },
  spaced: {
    marginTop: 14
  },
  spacedSmall: {
    marginTop: 8
  }
});
