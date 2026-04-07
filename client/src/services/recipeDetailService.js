import { API_BASE_URL } from "../constants/env";

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
    throw new Error(data.message || "No se ha podido completar la solicitud");
  }

  return data;
}

export async function getUserRecipeDetail(recipeId, token) {
  return request(`/user-recipes/${encodeURIComponent(recipeId)}`, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {}
  });
}

export async function addRecipeComment(token, recipeId, content) {
  return request(`/user-recipes/${encodeURIComponent(recipeId)}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
}

export async function rateRecipe(token, recipeId, value) {
  return request(`/user-recipes/${encodeURIComponent(recipeId)}/rating`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ value })
  });
}
