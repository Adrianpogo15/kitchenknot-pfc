import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL } from "../constants/env";

const TOKEN_STORAGE_KEY = "kitchenknot_access_token";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ha ocurrido un error en la solicitud");
  }

  return data;
}

export async function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getMyProfile(token) {
  return request("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateMyProfile(token, payload) {
  return request("/auth/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteMyAccount(token) {
  return request("/auth/me", {
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
