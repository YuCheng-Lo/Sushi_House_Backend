import type { Request, Response } from "express";
import * as authService from "../services/authService.js";
import { httpStatus } from "../constants/constants.js";

export const register = async (req: Request, res: Response) => {
  const { name, nickname, email, password } = req.body;

  const user = await authService.register({ name, nickname, email, password });

  return res.status(httpStatus.CREATED).json({
    success: "ok",
    message: "註冊成功",
    data: user,
  });
};
