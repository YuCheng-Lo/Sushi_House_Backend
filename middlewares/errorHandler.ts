import type { ErrorRequestHandler } from "express";
import AppError from "../utils/AppError.js";
import { httpStatus } from "../constants/constants.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });
};
