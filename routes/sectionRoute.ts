// POST   /sections
// GET    /sections 前台展示，只露ACTIVE
// GET    /sections/admin 後台展示
// PATCH  /sections/:id
// DELETE /sections/:id

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody } from "../validations/validate.js";
import { createSectionSchema } from "../validations/sectionValidation.js";
import {
  createSection,
  getAdminSections,
  getSections,
} from "../controllers/sectionController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(createSectionSchema),
  createSection,
);

router.get("/", getSections);

router.get("/admin", authenticate, getAdminSections);

export default router;
