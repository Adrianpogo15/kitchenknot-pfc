const express = require("express");

const authController = require("../../controllers/auth/authController");
const authMiddleware = require("../../middleware/authMiddleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authMiddleware, asyncHandler(authController.getMe));
router.put("/me", authMiddleware, asyncHandler(authController.updateMe));
router.delete("/me", authMiddleware, asyncHandler(authController.deleteMe));

module.exports = router;
