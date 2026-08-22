import { Router } from "express";
import {
  login,
  register,
  getMe,
  refresh,
} from "../controllers/authController.js";
import { validateBody } from "../validations/validate.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);

router.post("/login", validateBody(loginSchema), login);

router.get("/me", authenticate, getMe);

router.post("/refresh", refresh);

export default router;
