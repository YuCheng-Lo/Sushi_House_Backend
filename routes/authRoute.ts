import { Router } from "express";
import { register } from "../controllers/authController.js";
import { validateBody } from "../validations/validate.js";
import { registerSchema } from "../validations/authValidation.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);

export default router;
