import { Router } from "express";
import { imageUpload } from "../middlewares/imageUpload.js";
import { upload } from "../controllers/imageController.js";

const router = Router();

router.post("/upload", imageUpload.single("image"), upload);

export default router;
