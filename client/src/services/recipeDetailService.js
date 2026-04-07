import { requestJson } from "./httpClient";

export async function getUserRecipeDetail(recipeId, token) {
  return requestJson(`/user-recipes/${encodeURIComponent(recipeId)}`, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {}
  });
}

export async function addRecipeComment(token, recipeId, content) {
  return requestJson(`/user-recipes/${encodeURIComponent(recipeId)}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
}

export async function rateRecipe(token, recipeId, value) {
  return requestJson(`/user-recipes/${encodeURIComponent(recipeId)}/rating`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ value })
  });
}
