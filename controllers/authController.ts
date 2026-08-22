import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/authService.js";
import { httpStatus } from "../constants/constants.js";
import type { LoginInput } from "../validations/authValidation.js";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

export const register = async (req: Request, res: Response) => {
  const { name, nickname, email, password } = req.body;

  const user = await authService.register({ name, nickname, email, password });

  return res.status(httpStatus.CREATED).json({
    success: "ok",
    message: "註冊成功",
    data: user,
  });
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  const userAgent = req.headers["user-agent"] || "";
  const ipAddress = req.ip;

  const result = await authService.login({
    email,
    password,
    userAgent,
    ipAddress,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: env.refreshTokenLifetimeMs,
  });

  return res.status(httpStatus.OK).json({
    success: "ok",
    message: "登入成功",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("accessToken過期或無效", httpStatus.UNAUTHORIZED);
  }

  const user = await authService.getMe({
    id: req.user.userId,
  });

  if (!user) throw new AppError("找不到使用者", httpStatus.NOT_FOUND);

  return res.status(httpStatus.OK).json({
    success: "ok",
    message: "成功通過 Access Token 驗證",
    data: user,
  });
};
