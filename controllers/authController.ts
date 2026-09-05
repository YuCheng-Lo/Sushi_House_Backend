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
    success: true,
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
    success: true,
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
    success: true,
    message: "成功通過 Access Token 驗證",
    data: user,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const ip = req.ip ?? null;
  const user_agent = req.get("user-agent") ?? null;

  const { newAccessToken, newRefreshToken, expiresAt } =
    await authService.refresh({
      refreshToken,
      ip,
      user_agent,
    });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    expires: expiresAt,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    message: "refresh刷新成功",
    data: {
      accessToken: newAccessToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    await authService.logout({ refreshToken });
  } finally {
    //當初寫入 Cookie 時有設定特定的屬性，那麼在 logout 清除時，
    // secure 和 sameSite 這兩個參數必須完全一致，瀏覽器才會正確配合刪除。
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "登出成功",
  });
};
