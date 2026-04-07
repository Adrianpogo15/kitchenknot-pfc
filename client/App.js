import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import AppDrawer from "./src/components/common/AppDrawer";
import LoadingSplash from "./src/components/common/LoadingSplash";
import AuthScreen from "./src/screens/auth/AuthScreen";
import HomeScreen from "./src/screens/home/HomeScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import FavoritesScreen from "./src/screens/recipes/FavoritesScreen";
import MyRecipesScreen from "./src/screens/recipes/MyRecipesScreen";
import UserRecipeDetailScreen from "./src/screens/recipes/UserRecipeDetailScreen";
import UserRecipesScreen from "./src/screens/recipes/UserRecipesScreen";
import ExternalRecipeDetailScreen from "./src/screens/search/ExternalRecipeDetailScreen";
import SearchScreen from "./src/screens/search/SearchScreen";
import ShoppingListsScreen from "./src/screens/shopping/ShoppingListsScreen";
import { clearToken, getMyProfile, loadToken, saveToken } from "./src/services/authService";
import { ThemeProvider, useAppTheme } from "./src/styles/theme";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [session, setSession] = useState({ status: "booting" });
  const [activeScreen, setActiveScreen] = useState("home");
  const [screenParams, setScreenParams] = useState(null);
  const { theme } = useAppTheme();

  useEffect(() => {
    async function bootstrap() {
      try {
        const storedToken = await loadToken();

        if (!storedToken) {
          setSession({ status: "anonymous" });
          return;
        }

        const response = await getMyProfile(storedToken);
        setSession({
          status: "authenticated",
          token: storedToken,
          profile: response.data
        });
      } catch (_error) {
        await clearToken();
        setSession({ status: "anonymous" });
      }
    }

    bootstrap();
  }, []);

  async function handleAuthenticated(token, profile) {
    await saveToken(token);
    setSession({
      status: "authenticated",
      token,
      profile
    });
    handleNavigate("home");
  }

  function handleProfileUpdated(nextProfile) {
    setSession((current) => ({
      ...current,
      profile: nextProfile
    }));
  }

  function handleGuestAccess() {
    setSession({ status: "guest" });
    handleNavigate("home");
  }

  async function handleLogout() {
    await clearToken();
    setSession({ status: "anonymous" });
    handleNavigate("home");
  }

  function handleGoToAuth(mode = "login") {
    setSession({ status: "anonymous", preferredMode: mode });
    handleNavigate("home");
  }

  function handleNavigate(screen, params = null) {
    setActiveScreen(screen);
    setScreenParams(params);
  }

  if (session.status === "booting") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <StatusBar style={theme.isDark ? "light" : "dark"} />
          <LoadingSplash />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (session.status === "anonymous") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <StatusBar style={theme.isDark ? "light" : "dark"} />
          <AuthScreen
            initialMode={session.preferredMode || "login"}
            onAuthenticated={handleAuthenticated}
            onContinueAsGuest={handleGuestAccess}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const isGuest = session.status === "guest";
  const profile = session.profile || null;
  const drawerActiveScreen =
    activeScreen === "externalRecipeDetail"
      ? "search"
      : activeScreen === "userRecipeDetail"
        ? screenParams?.origin || "userRecipes"
        : activeScreen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <AppDrawer
          activeScreen={drawerActiveScreen}
          onNavigate={handleNavigate}
          profile={profile}
          isGuest={isGuest}
          onLoginPress={() => handleGoToAuth("login")}
          onRegisterPress={() => handleGoToAuth("register")}
          onLogout={handleLogout}
        >
          {activeScreen === "home" ? (
            <HomeScreen isGuest={isGuest} profile={profile} onNavigate={handleNavigate} />
          ) : null}
          {activeScreen === "search" ? (
            <SearchScreen
              onOpenRecipe={(recipe) => handleNavigate("externalRecipeDetail", { recipe })}
            />
          ) : null}
          {activeScreen === "userRecipes" ? (
            <UserRecipesScreen
              token={session.token}
              isGuest={isGuest}
              profile={profile}
              onRequireAuth={() => handleGoToAuth("login")}
              onOpenRecipe={(recipe) =>
                handleNavigate("userRecipeDetail", {
                  recipeId: recipe.id,
                  origin: "userRecipes"
                })
              }
            />
          ) : null}
          {activeScreen === "favorites" ? (
            <FavoritesScreen
              token={session.token}
              isGuest={isGuest}
              onRequireAuth={() => handleGoToAuth("login")}
              onOpenRecipe={(recipe) =>
                handleNavigate("userRecipeDetail", {
                  recipeId: recipe.id,
                  origin: "favorites"
                })
              }
            />
          ) : null}
          {activeScreen === "myRecipes" ? (
            <MyRecipesScreen
              token={session.token}
              isGuest={isGuest}
              onRequireAuth={() => handleGoToAuth("login")}
              onOpenRecipe={(recipe) =>
                handleNavigate("userRecipeDetail", {
                  recipeId: recipe.id,
                  origin: "myRecipes"
                })
              }
            />
          ) : null}
          {activeScreen === "shopping" ? (
            <ShoppingListsScreen
              token={session.token}
              isGuest={isGuest}
              onRequireAuth={() => handleGoToAuth("login")}
            />
          ) : null}
          {activeScreen === "profile" ? (
            <ProfileScreen
              token={session.token}
              isGuest={isGuest}
              profile={profile}
              onLogout={handleLogout}
              onLoginPress={() => handleGoToAuth("login")}
              onRegisterPress={() => handleGoToAuth("register")}
              onProfileUpdated={handleProfileUpdated}
            />
          ) : null}
          {activeScreen === "externalRecipeDetail" ? (
            <ExternalRecipeDetailScreen
              recipe={screenParams?.recipe}
              onBack={() => handleNavigate("search")}
            />
          ) : null}
          {activeScreen === "userRecipeDetail" ? (
            <UserRecipeDetailScreen
              recipeId={screenParams?.recipeId}
              token={session.token}
              isGuest={isGuest}
              onRequireAuth={() => handleGoToAuth("login")}
              onBack={() => handleNavigate(screenParams?.origin || "userRecipes")}
            />
          ) : null}
        </AppDrawer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  }
});
