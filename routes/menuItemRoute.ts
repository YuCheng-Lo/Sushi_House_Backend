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
  deleteMenuItem,
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

router.delete(
  "/:id",
  authenticate,
  validateParams(menuItemIdSchema),
  deleteMenuItem,
);

export default router;
