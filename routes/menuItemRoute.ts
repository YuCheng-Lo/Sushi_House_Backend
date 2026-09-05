// POST   /menu-items
// GET    /menu-items
// GET    /menu-items/admin
// PATCH  /menu-items/:id
// DELETE /menu-items/:id

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody, validateParams } from "../validations/validate.js";
import {
  createMenuItemSchema,
  menuItemIdSchema,
  updateMenuItemSchema,
} from "../validations/menuItemValidation.js";
import {
  createMenuItem,
  getMenuItems,
  getAdminMenuItems,
  updateMenuItem,
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

router.patch(
  "/:id",
  authenticate,
  validateParams(menuItemIdSchema),
  validateBody(updateMenuItemSchema),
  updateMenuItem,
);

export default router;
