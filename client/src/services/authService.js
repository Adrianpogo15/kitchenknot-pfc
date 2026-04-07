import AsyncStorage from "@react-native-async-storage/async-storage";

import { requestJson } from "./httpClient";

const TOKEN_STORAGE_KEY = "kitchenknot_access_token";

export async function registerUser(payload) {
  return requestJson("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload) {
  return requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getMyProfile(token) {
  return requestJson("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateMyProfile(token, payload) {
  return requestJson("/auth/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteMyAccount(token) {
  return requestJson("/auth/me", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function loadToken() {
  return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}
