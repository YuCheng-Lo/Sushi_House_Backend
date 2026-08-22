import ms, { type StringValue } from "ms";

const nodeEnv = process.env.NODE_ENV ?? "development";

const saltRounds = Number(process.env.SALT_ROUNDS);

const accessTokenExpiresIn = process.env
  .ACCESS_TOKEN_EXPIRES_IN! as StringValue;

const refreshTokenExpiresIn = process.env
  .REFRESH_TOKEN_EXPIRES_IN! as StringValue;

if (!process.env.SALT_ROUNDS) {
  throw new Error("SALT_ROUNDS 未設定");
}

if (Number.isNaN(saltRounds)) {
  throw new Error("SALT_ROUNDS 必須是數字");
}

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET 未設定");
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET 未設定");
}

if (!process.env.ACCESS_TOKEN_EXPIRES_IN) {
  throw new Error("ACCESS_TOKEN_EXPIRES_IN 未設定");
}

export const env = {
  nodeEnv,

  isProduction: nodeEnv === "production",

  saltRounds,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,

  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,

  accessTokenExpiresIn,

  refreshTokenExpiresIn,

  refreshTokenLifetimeMs: ms(refreshTokenExpiresIn),
};
