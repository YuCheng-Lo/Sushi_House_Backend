import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import { httpStatus } from "../constants/constants.js";
import type { RegisterInput } from "../validations/authValidation.js";

export const register = async (data: RegisterInput) => {
  const { name, nickname, email, password } = data;
  const saltRounds = env.saltRounds;

  // 1. 檢查 Email 是否已被註冊
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) throw new AppError("Email已被註冊", httpStatus.CONFLICT);

  // 2. 密碼加密
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 3. 寫入資料庫
  const user = await prisma.user.create({
    data: {
      name,
      nickname: nickname ?? null,
      email,
      password: hashedPassword,
    },
    select: {
      name: true,
      nickname: true,
      email: true,
    },
  });

  // 4. 回傳處理好的 User 資料
  return user;
};
