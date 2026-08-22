import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { validateBody } from "../validations/validate.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);

router.post("/login", validateBody(loginSchema), login);

export default router;
