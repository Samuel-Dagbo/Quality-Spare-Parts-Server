const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);

module.exports = router;
