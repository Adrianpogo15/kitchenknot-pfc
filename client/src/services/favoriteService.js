import { requestJson } from "./httpClient";

export async function getFavorites(token, params = {}) {
  const searchParams = new URLSearchParams();

  if (params.name?.trim()) {
    searchParams.set("name", params.name.trim());
  }

  searchParams.set("page", String(params.page || 1));
  searchParams.set("pageSize", String(params.pageSize || 10));

  return requestJson(`/favorites?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function addFavorite(token, recipe) {
  return requestJson("/favorites", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      recipeId: recipe.id
    })
  });
}

export async function removeFavorite(token, recipeId) {
  return requestJson(`/favorites?recipeId=${encodeURIComponent(recipeId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function getFavoriteStatuses(token, recipeIds) {
  if (!recipeIds.length) {
    return { ok: true, data: [] };
  }

  return requestJson(`/favorites/status?ids=${encodeURIComponent(recipeIds.join(","))}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
