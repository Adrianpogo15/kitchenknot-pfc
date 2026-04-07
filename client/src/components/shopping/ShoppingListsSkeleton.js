import React from "react";
import { StyleSheet, View } from "react-native";

import SkeletonBlock from "../common/SkeletonBlock";

export default function ShoppingListsSkeleton() {
  return (
    <View>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.texts}>
              <SkeletonBlock height={20} width="70%" />
              <SkeletonBlock height={14} width="40%" style={styles.meta} />
            </View>
            <SkeletonBlock height={38} width={38} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  texts: {
    flex: 1
  },
  meta: {
    marginTop: 8
  }
});
