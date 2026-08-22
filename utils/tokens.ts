import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import type {
  RefreshTokenPayload,
  VerifyRefreshTokenOptions,
} from "../types/auth.js";
import AppError from "./AppError.js";
import { httpStatus } from "../constants/constants.js";

const accessTokenSecret = env.accessTokenSecret;
const refreshTokenSecret = env.refreshTokenSecret;

const accessTokenExpiresIn = env.accessTokenExpiresIn;

export const generateAccessToken = (userId: number, email: string): string => {
  const accessToken = jwt.sign({ email }, accessTokenSecret, {
    subject: userId.toString(),
    expiresIn: accessTokenExpiresIn,
  });

  return accessToken;
};

export const generateRefreshToken = (
  sessionId: string,
  userId: number,
  expiresAt: Date,
): string => {
  const expiresAtInSeconds = Math.floor(expiresAt.getTime() / 1000);
  const refreshToken = jwt.sign(
    { sessionId, exp: expiresAtInSeconds },
    refreshTokenSecret,
    {
      subject: userId.toString(),
    },
  );
  return refreshToken;
};

export const isRefreshTokenPayload = (
  payload: string | JwtPayload,
): payload is RefreshTokenPayload => {
  return (
    typeof payload !== "string" &&
    typeof payload.sub === "string" &&
    typeof payload.sessionId === "string" &&
    typeof payload.iat === "number" &&
    typeof payload.exp === "number"
  );
};

export const tryVerifyRefreshToken = (
  refreshToken: string,
  options?: VerifyRefreshTokenOptions,
): RefreshTokenPayload | null => {
  try {
    const payload = jwt.verify(refreshToken, env.refreshTokenSecret, {
      ignoreExpiration: options?.ignoreExpiration ?? false,
    });

    if (!isRefreshTokenPayload(payload)) return null;

    return payload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  refreshToken: string,
  options?: VerifyRefreshTokenOptions,
): RefreshTokenPayload => {
  const payload = tryVerifyRefreshToken(refreshToken, options);

  if (!payload) {
    throw new AppError(
      "refreshToken過期、無效或格式錯誤",
      httpStatus.UNAUTHORIZED,
    );
  }

  return payload;
};
