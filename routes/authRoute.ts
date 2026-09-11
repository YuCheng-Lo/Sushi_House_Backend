import { Router } from "express";
import {
  login,
  register,
  getMe,
  refresh,
  logout,
} from "../controllers/authController.js";
import { validateBody } from "../validations/validate.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import { authenticate } from "../middlewares/authenticate.js";
import { loginIpRateLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);

router.post("/login", loginIpRateLimiter, validateBody(loginSchema), login);

router.get("/me", authenticate, getMe);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;
