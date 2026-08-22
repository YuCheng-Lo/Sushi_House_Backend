import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import { httpStatus } from "../constants/constants.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.get("authorization");

  if (!authorization) throw new AppError("尚未登入", httpStatus.UNAUTHORIZED);

  const [bearerSchema, accessToken] = authorization.split(" ");

  if (bearerSchema !== "Bearer" || !accessToken) {
    throw new AppError("Authorization 格式錯誤", httpStatus.UNAUTHORIZED);
  }

  try {
    const payload = jwt.verify(accessToken, env.accessTokenSecret);

    if (typeof payload === "string") {
      throw new AppError("Token 格式錯誤", httpStatus.UNAUTHORIZED);
    }

    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number"
    ) {
      throw new AppError("Token Payload 格式錯誤", httpStatus.UNAUTHORIZED);
    }

    req.user = {
      userId: Number(payload.sub),
      email: payload.email,
    };

    next();
  } catch (err) {
    throw new AppError("accessToken過期或無效", httpStatus.UNAUTHORIZED);
  }
};
