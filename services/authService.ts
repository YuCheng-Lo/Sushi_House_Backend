import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import { httpStatus } from "../constants/constants.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validations/authValidation.js";

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

export const login = async (data: LoginInput) => {
  const { email, password, userAgent, ipAddress } = data;

  // 1. 檢查 Email 是否已存在
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) throw new AppError("帳號或密碼錯誤", httpStatus.UNAUTHORIZED);

  // 2. 比對密碼是否正確
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    throw new AppError("帳號或密碼錯誤", httpStatus.UNAUTHORIZED);

  // 3. 預先手動生成 sessionId (打破循環!)
  const sessionId = crypto.randomUUID();

  // 4. 計算 Session 到期時間
  const expiresAt = new Date(Date.now() + env.refreshTokenLifetimeMs);

  // 5. 簽發accessToken、refreshToken
  const accessToken = generateAccessToken(user.id, email);
  const refreshToken = generateRefreshToken(sessionId, user.id, expiresAt);

  // 6. 對 RefreshToken 進行 Hash
  const saltRounds = env.saltRounds;
  const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);

  // 7. 建立 Session 資料表
  await prisma.session.create({
    data: {
      id: sessionId,
      refresh_token_hash: refreshTokenHash,

      user_agent: userAgent,
      ip_address: ipAddress,

      expires_at: expiresAt,
      user_id: user.id,
    },
  });

  // 8. 回傳accessToken、refreshToken
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};
