const express = require("express");
const { listUsers, createUser, updateUserRole, updateUserStatus } = require("../controllers/user.controller");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createUserSchema, roleUpdateSchema, statusUpdateSchema } = require("../validators/user.schema");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), listUsers);
router.post("/", requireAuth, requireRole("admin"), validate(createUserSchema), createUser);
router.patch("/:id/role", requireAuth, requireRole("admin"), validate(roleUpdateSchema), updateUserRole);
router.patch("/:id/status", requireAuth, requireRole("admin"), validate(statusUpdateSchema), updateUserStatus);

module.exports = router;
