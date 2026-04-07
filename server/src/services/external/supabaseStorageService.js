const crypto = require("crypto");

const env = require("../../config/env");

const DEFAULT_BUCKET = env.supabaseRecipeImagesBucket || "recipe-images";
let bucketReadyPromise;

async function requestSupabase(path, options = {}) {
  const response = await fetch(`${env.supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      ...(options.headers || {})
    }
  });

  return response;
}

async function ensureBucket() {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const response = await requestSupabase("/storage/v1/bucket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: DEFAULT_BUCKET,
          name: DEFAULT_BUCKET,
          public: true
        })
      });

      if (response.ok) {
        return;
      }

      const body = await response.text();
      if (response.status === 409 || body.toLowerCase().includes("exists")) {
        return;
      }

      throw new Error("No se ha podido preparar el bucket de imágenes");
    })();
  }

  return bucketReadyPromise;
}

function buildPublicUrl(path) {
  return `${env.supabaseUrl}/storage/v1/object/public/${DEFAULT_BUCKET}/${path}`;
}

function getPathFromPublicUrl(url) {
  if (!url) {
    return null;
  }

  const marker = `/storage/v1/object/public/${DEFAULT_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return url.slice(index + marker.length);
}

async function uploadRecipeImage(userId, imageUpload) {
  if (!imageUpload?.base64) {
    return null;
  }

  await ensureBucket();

  const mimeType = imageUpload.mimeType || "image/jpeg";
  const extension = mimeType.split("/")[1] || "jpg";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(imageUpload.base64, "base64");

  const response = await requestSupabase(
    `/storage/v1/object/${DEFAULT_BUCKET}/${encodeURIComponent(path).replace(/%2F/g, "/")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": mimeType,
        "x-upsert": "true"
      },
      body: buffer
    }
  );

  if (!response.ok) {
    throw new Error("No se ha podido subir la imagen de la receta");
  }

  return buildPublicUrl(path);
}

async function deleteRecipeImageByUrl(url) {
  const path = getPathFromPublicUrl(url);

  if (!path) {
    return;
  }

  await requestSupabase(
    `/storage/v1/object/${DEFAULT_BUCKET}/${encodeURIComponent(path).replace(/%2F/g, "/")}`,
    {
      method: "DELETE"
    }
  );
}

module.exports = {
  uploadRecipeImage,
  deleteRecipeImageByUrl
};
