import multer from "multer";

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
});
