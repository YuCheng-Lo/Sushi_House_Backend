// POST   /menu-items
// GET    /menu-items
// GET    /menu-items/admin
// PATCH  /menu-items/:id
// DELETE /menu-items/:id

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody } from "../validations/validate.js";
import { createMenuItemSchema } from "../validations/menuItemValidation.js";
import {
  createMenuItem,
  getMenuItems,
  getAdminMenuItems,
} from "../controllers/menuItemController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(createMenuItemSchema),
  createMenuItem,
);

router.get("/", getMenuItems);
router.get("/admin", authenticate, getAdminMenuItems);

export default router;
