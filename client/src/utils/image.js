import { API_BASE_URL } from "../constants/env";

const PUBLIC_API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const LOCAL_API_ORIGINS = [
  "http://192.168.1.131:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

export function normalizeImageUri(uri) {
  if (!uri || typeof uri !== "string") {
    return "";
  }

  if (uri.startsWith("data:")) {
    return uri;
  }

  if (uri.startsWith("/static/")) {
    return `${PUBLIC_API_ORIGIN}${uri}`;
  }

  const localOrigin = LOCAL_API_ORIGINS.find((origin) => uri.startsWith(origin));

  if (localOrigin) {
    return `${PUBLIC_API_ORIGIN}${uri.slice(localOrigin.length)}`;
  }

  return uri;
}
