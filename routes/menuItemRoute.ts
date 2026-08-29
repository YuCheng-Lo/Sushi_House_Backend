import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody } from "../validations/validate.js";
import { createMenuItemSchema } from "../validations/menuItemValidation.js";
import { createMenuItem } from "../controllers/menuItemController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(createMenuItemSchema),
  createMenuItem,
);

export default router;
