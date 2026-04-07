import React, { forwardRef } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useAppTheme } from "../../styles/theme";

const ScreenShell = forwardRef(function ScreenShell(
  { children, contentContainerStyle, onContentSizeChange },
  ref
) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.scroll}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <KeyboardAwareScrollView
        ref={ref}
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={28}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />
        {children}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
});

export default ScreenShell;

const createStyles = (theme) =>
  StyleSheet.create({
  scroll: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 88,
    backgroundColor: theme.colors.background
  },
  backgroundOrbTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    opacity: 0.7,
    top: -80,
    right: -100
  },
  backgroundOrbBottom: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: theme.colors.cream,
    opacity: 0.55,
    bottom: 20,
    left: -80
  }
});
