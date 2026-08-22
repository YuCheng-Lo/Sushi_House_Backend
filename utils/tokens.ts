import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

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
