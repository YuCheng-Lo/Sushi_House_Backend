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
  deleteSection,
  getAdminSections,
  getSectionDeletionImpact,
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

router.get(
  "/:id/deletion-impact",
  authenticate,
  validateParams(sectionIdSchema),
  getSectionDeletionImpact,
);

router.patch(
  "/:id",
  authenticate,
  validateParams(sectionIdSchema),
  validateBody(updateSectionSchema),
  updateSection,
);

router.delete(
  "/:id",
  authenticate,
  validateParams(sectionIdSchema),
  deleteSection,
);

export default router;
