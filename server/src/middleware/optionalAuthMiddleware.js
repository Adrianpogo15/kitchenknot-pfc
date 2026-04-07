const jwt = require("jsonwebtoken");

const env = require("../config/env");

function optionalAuthMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.username
    };
  } catch (_error) {
    req.user = null;
  }

  return next();
}

module.exports = optionalAuthMiddleware;
