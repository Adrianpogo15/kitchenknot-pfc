const jwt = require("jsonwebtoken");

const env = require("../config/env");
const createHttpError = require("../utils/httpError");

function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError(401, "Token de acceso no proporcionado"));
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    if (!env.jwtSecret) {
      throw createHttpError(500, "JWT_SECRET no esta configurado en el servidor");
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.username
    };

    return next();
  } catch (error) {
    return next(createHttpError(401, "Token invalido o expirado"));
  }
}

module.exports = authMiddleware;
