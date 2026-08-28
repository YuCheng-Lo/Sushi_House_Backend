import { httpStatus } from "../constants/constants.js";
import AppError from "../utils/AppError.js";
import * as imageService from "../services/imageService.js";
import type { Request, Response } from "express";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const upload = async (req: MulterRequest, res: Response) => {
  if (!req.file) {
    throw new AppError("並未附上圖片", httpStatus.BAD_REQUEST);
  }

  const result = await imageService.upload(req.file);

  return res.status(httpStatus.OK).json({
    success: "ok",
    message: "圖片上傳成功",
    data: result,
  });
};
