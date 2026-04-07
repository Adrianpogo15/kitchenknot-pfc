import { requestJson } from "./httpClient";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getShoppingLists(token) {
  return requestJson("/shopping-lists", {
    method: "GET",
    headers: authHeaders(token)
  });
}

export async function createShoppingList(token, payload) {
  return requestJson("/shopping-lists", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function getShoppingListDetail(token, listId) {
  return requestJson(`/shopping-lists/${encodeURIComponent(listId)}`, {
    method: "GET",
    headers: authHeaders(token)
  });
}

export async function deleteShoppingList(token, listId) {
  return requestJson(`/shopping-lists/${encodeURIComponent(listId)}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function addShoppingListItem(token, listId, payload) {
  return requestJson(`/shopping-lists/${encodeURIComponent(listId)}/items`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function updateShoppingListItem(token, listId, itemId, payload) {
  return requestJson(
    `/shopping-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }
  );
}

export async function deleteShoppingListItem(token, listId, itemId) {
  return requestJson(
    `/shopping-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "DELETE",
      headers: authHeaders(token)
    }
  );
}

export async function importRecipeToShoppingList(token, payload) {
  return requestJson("/shopping-lists/import-recipe", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}
