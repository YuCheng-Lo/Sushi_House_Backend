import { Router } from "express";
import { imageUpload } from "../middlewares/imageUpload.js";
import { upload } from "../controllers/imageController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/upload", authenticate, imageUpload.single("image"), upload);

export default router;
