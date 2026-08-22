import type { ErrorRequestHandler } from "express";
import AppError from "../utils/AppError.js";
import { ZodError } from "zod";
import { httpStatus } from "../constants/constants.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "請求資料格式錯誤",
      errors: err.issues,
    });
  }

  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });
};
