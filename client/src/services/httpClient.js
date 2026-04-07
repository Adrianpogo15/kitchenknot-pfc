import { API_BASE_URL } from "../constants/env";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildHeaders(options = {}) {
  return {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
}

async function parseResponse(response) {
  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const looksLikeJson =
    contentType.includes("application/json") ||
    rawText.trim().startsWith("{") ||
    rawText.trim().startsWith("[");

  if (!looksLikeJson) {
    return {
      data: null,
      rawText
    };
  }

  try {
    return {
      data: JSON.parse(rawText),
      rawText
    };
  } catch (_error) {
    return {
      data: null,
      rawText
    };
  }
}

function buildErrorMessage(response, parsed) {
  if (parsed?.data?.message) {
    return parsed.data.message;
  }

  if (parsed?.rawText?.trim()) {
    if (parsed.rawText.includes("Not Found")) {
      return "El servidor no encontró la ruta solicitada.";
    }

    if (parsed.rawText.includes("<!DOCTYPE") || parsed.rawText.includes("<html")) {
      return "El servidor ha devuelto una página HTML en lugar de JSON.";
    }

    return parsed.rawText.trim();
  }

  if (response.status >= 500) {
    return "El servidor está tardando en responder. Inténtalo de nuevo en unos segundos.";
  }

  return "Ha ocurrido un error en la solicitud";
}

export async function requestJson(path, options = {}, retryCount = 1) {
  const method = (options.method || "GET").toUpperCase();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options)
  });

  const parsed = await parseResponse(response);

  if (
    !response.ok &&
    retryCount > 0 &&
    method === "GET" &&
    [502, 503, 504].includes(response.status)
  ) {
    await sleep(1200);
    return requestJson(path, options, retryCount - 1);
  }

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, parsed));
  }

  if (!parsed.data) {
    throw new Error("El servidor no ha devuelto una respuesta JSON válida.");
  }

  return parsed.data;
}
