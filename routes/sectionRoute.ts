// POST   /sections
// GET    /sections 前台展示，只露ACTIVE
// GET    /sections/admin 後台展示
// PATCH  /sections/:id
// DELETE /sections/:id

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody, validateParams } from "../validations/validate.js";
import {
  createSectionSchema,
  sectionIdSchema,
  updateSectionSchema,
} from "../validations/sectionValidation.js";
import {
  createSection,
  getAdminSections,
  getSections,
  updateSection,
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

router.patch(
  "/:id",
  authenticate,
  validateParams(sectionIdSchema),
  validateBody(updateSectionSchema),
  updateSection,
);

export default router;
