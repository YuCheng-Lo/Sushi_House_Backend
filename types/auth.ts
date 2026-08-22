import { type JwtPayload } from "jsonwebtoken";
export interface AuthUser {
  userId: number;
  email: string;
}

export interface GetMeInput {
  id: number;
}

export interface RefreshInput {
  refreshToken: string | undefined;
  ip: string | null;
  user_agent: string | null;
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface VerifyRefreshTokenOptions {
  ignoreExpiration?: boolean;
}

export interface LogoutInput {
  refreshToken: string | undefined;
}
