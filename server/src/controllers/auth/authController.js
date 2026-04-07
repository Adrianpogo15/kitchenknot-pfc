const authService = require("../../services/internal/authService");

async function register(req, res) {
  const result = await authService.register(req.body);

  res.status(201).json({
    ok: true,
    message: "Usuario registrado correctamente",
    data: result
  });
}

async function login(req, res) {
  const result = await authService.login(req.body);

  res.status(200).json({
    ok: true,
    message: "Sesion iniciada correctamente",
    data: result
  });
}

async function getMe(req, res) {
  const profile = await authService.getProfile(req.user.id);

  res.status(200).json({
    ok: true,
    data: profile
  });
}

async function updateMe(req, res) {
  const profile = await authService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    ok: true,
    message: "Perfil actualizado correctamente",
    data: profile
  });
}

async function deleteMe(req, res) {
  await authService.deleteAccount(req.user.id);

  res.status(200).json({
    ok: true,
    message: "Usuario dado de baja correctamente"
  });
}

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  deleteMe
};
