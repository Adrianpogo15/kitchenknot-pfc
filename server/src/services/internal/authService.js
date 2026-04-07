const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../../config/env");
const authRepository = require("../../repositories/authRepository");
const pickUserProfile = require("../../utils/pickUserProfile");
const createHttpError = require("../../utils/httpError");

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function validateRegisterInput(payload) {
  const email = normalizeOptionalString(payload.email)?.toLowerCase();
  const username = normalizeOptionalString(payload.username);
  const password = normalizeOptionalString(payload.password);

  if (!email || !validateEmail(email)) {
    throw createHttpError(400, "Debes indicar un email valido");
  }

  if (!username || username.length < 3) {
    throw createHttpError(400, "El nombre de usuario debe tener al menos 3 caracteres");
  }

  if (!password || password.length < 6) {
    throw createHttpError(400, "La contrasena debe tener al menos 6 caracteres");
  }

  return {
    email,
    username,
    password,
    firstName: normalizeOptionalString(payload.firstName),
    lastName: normalizeOptionalString(payload.lastName),
    bio: normalizeOptionalString(payload.bio),
    birthDate: normalizeOptionalString(payload.birthDate),
    avatarUrl: normalizeOptionalString(payload.avatarUrl)
  };
}

function validateLoginInput(payload) {
  const email = normalizeOptionalString(payload.email)?.toLowerCase();
  const password = normalizeOptionalString(payload.password);

  if (!email || !password) {
    throw createHttpError(400, "Email y contrasena son obligatorios");
  }

  return { email, password };
}

function validateUpdateInput(payload) {
  const firstName =
    payload.firstName === undefined || payload.firstName === null
      ? ""
      : String(payload.firstName).trim();
  const lastName =
    payload.lastName === undefined || payload.lastName === null
      ? ""
      : String(payload.lastName).trim();
  const bio =
    payload.bio === undefined || payload.bio === null ? "" : String(payload.bio).trim();
  const birthDate = normalizeOptionalString(payload.birthDate);

  if (!firstName) {
    throw createHttpError(400, "El nombre es obligatorio");
  }

  if (!lastName) {
    throw createHttpError(400, "Los apellidos son obligatorios");
  }

  if (!birthDate) {
    throw createHttpError(400, "La fecha de nacimiento es obligatoria");
  }

  return {
    firstName,
    lastName,
    bio,
    birthDate,
    avatarUrl: payload.avatarUrl === undefined ? undefined : normalizeOptionalString(payload.avatarUrl),
    removeAvatar: Boolean(payload.removeAvatar)
  };
}

function createAccessToken(user) {
  if (!env.jwtSecret) {
    throw createHttpError(500, "JWT_SECRET no esta configurado en el servidor");
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

async function register(payload) {
  const data = validateRegisterInput(payload);

  const existingEmail = await authRepository.findUserByEmail(data.email);
  if (existingEmail) {
    throw createHttpError(409, "Ya existe un usuario con ese email");
  }

  const existingUsername = await authRepository.findUserByUsername(data.username);
  if (existingUsername) {
    throw createHttpError(409, "Ese nombre de usuario ya esta en uso");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await authRepository.createUser({
    ...data,
    passwordHash
  });

  const accessToken = createAccessToken(user);

  return {
    user: pickUserProfile(user),
    accessToken
  };
}

async function login(payload) {
  const data = validateLoginInput(payload);
  const user = await authRepository.findUserByEmail(data.email);

  if (!user || user.deleted_at || !user.is_active) {
    throw createHttpError(401, "Credenciales invalidas");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

  if (!isPasswordValid) {
    throw createHttpError(401, "Credenciales invalidas");
  }

  const accessToken = createAccessToken(user);

  return {
    user: pickUserProfile(user),
    accessToken
  };
}

async function getProfile(userId) {
  const user = await authRepository.findUserById(userId);

  if (!user || user.deleted_at || !user.is_active) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  return pickUserProfile(user);
}

async function updateProfile(userId, payload) {
  const currentUser = await authRepository.findUserById(userId);
  if (!currentUser || currentUser.deleted_at || !currentUser.is_active) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  const data = validateUpdateInput(payload);
  const updatedUser = await authRepository.updateUserProfile(userId, data);
  return pickUserProfile(updatedUser);
}

async function deleteAccount(userId) {
  const user = await authRepository.findUserById(userId);

  if (!user || user.deleted_at || !user.is_active) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  await authRepository.deactivateUser(userId);
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount
};
