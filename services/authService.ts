import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import { httpStatus } from "../constants/constants.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validations/authValidation.js";
import type { GetMeInput, RefreshInput } from "../types/auth.js";

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

export const getMe = async (data: GetMeInput) => {
  const { id } = data;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      created_at: true,
    },
  });
  return user;
};

export const refresh = async (data: RefreshInput) => {
  const { refreshToken, ip, user_agent } = data;

  if (!refreshToken) {
    throw new AppError("不存在的refreshToken", httpStatus.UNAUTHORIZED);
  }

  const payload = verifyRefreshToken(refreshToken);

  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError("Token Payload格式錯誤", httpStatus.UNAUTHORIZED);
  }

  const session = await prisma.session.findUnique({
    where: {
      id: payload.sessionId,
    },
    include: {
      user: {
        //只抓取需要用的email
        select: {
          email: true,
        },
      },
    },
  });

  if (!session || session.user_id !== userId) {
    throw new AppError("無效的token", httpStatus.UNAUTHORIZED);
  }

  if (session?.revoked_at) {
    throw new AppError("此登入狀態已失效，請重新登入", httpStatus.UNAUTHORIZED);
  }

  if (session.expires_at < new Date()) {
    throw new AppError("Token已過期", httpStatus.UNAUTHORIZED);
  }

  const refreshTokenHash = session.refresh_token_hash;
  const isValidRefreshTokenHash = await bcrypt.compare(
    refreshToken,
    refreshTokenHash,
  );

  if (!isValidRefreshTokenHash) {
    console.warn(
      `Refresh Token 不符合目前版本：User ${userId}, Session ${payload.sessionId}`,
    );

    throw new AppError(
      "Refresh Token 已失效，請重新登入",
      httpStatus.UNAUTHORIZED,
    );
  }

  //產生新的accessToken 與 refreshToken
  const newAccessToken = generateAccessToken(userId, session.user.email);
  const newRefreshToken = generateRefreshToken(
    payload.sessionId,
    userId,
    session.expires_at,
  );

  //產生新的refreshTokenHash
  const saltRounds = env.saltRounds;

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, saltRounds);

  //更新對應sessionId的refreshTokenHash欄位的值 與 user_agent, ip_address
  const updateResult = await prisma.session.updateMany({
    where: {
      id: payload.sessionId,
      version: session.version,
    },
    data: {
      refresh_token_hash: newRefreshTokenHash,
      user_agent,
      ip_address: ip,
      version: {
        increment: 1,
      },
    },
  });

  if (updateResult.count !== 1) {
    throw new AppError(
      "Refresh Token 已被更新，請重新嘗試",
      httpStatus.UNAUTHORIZED,
    );
  }

  return {
    newAccessToken,
    newRefreshToken,
    expiresAt: session.expires_at,
  };
};
