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

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getShoppingLists(token) {
  return request("/shopping-lists", {
    method: "GET",
    headers: authHeaders(token)
  });
}

export async function createShoppingList(token, payload) {
  return request("/shopping-lists", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function getShoppingListDetail(token, listId) {
  return request(`/shopping-lists/${encodeURIComponent(listId)}`, {
    method: "GET",
    headers: authHeaders(token)
  });
}

export async function deleteShoppingList(token, listId) {
  return request(`/shopping-lists/${encodeURIComponent(listId)}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function addShoppingListItem(token, listId, payload) {
  return request(`/shopping-lists/${encodeURIComponent(listId)}/items`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function updateShoppingListItem(token, listId, itemId, payload) {
  return request(
    `/shopping-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }
  );
}

export async function deleteShoppingListItem(token, listId, itemId) {
  return request(
    `/shopping-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "DELETE",
      headers: authHeaders(token)
    }
  );
}

export async function importRecipeToShoppingList(token, payload) {
  return request("/shopping-lists/import-recipe", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}
