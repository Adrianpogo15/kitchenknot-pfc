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

export async function getFavorites(token, params = {}) {
  const searchParams = new URLSearchParams();

  if (params.name?.trim()) {
    searchParams.set("name", params.name.trim());
  }

  searchParams.set("page", String(params.page || 1));
  searchParams.set("pageSize", String(params.pageSize || 10));

  return request(`/favorites?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function addFavorite(token, recipe) {
  return request("/favorites", {
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
  return request(`/favorites?recipeId=${encodeURIComponent(recipeId)}`, {
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

  return request(`/favorites/status?ids=${encodeURIComponent(recipeIds.join(","))}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
