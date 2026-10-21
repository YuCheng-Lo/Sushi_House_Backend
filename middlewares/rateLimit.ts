import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

// express-rate-limit基本概念
// 1. windowMs，也就是所謂的windowMs: 5 * 60 * 1000，5分鐘時間限制。
// 2. limit：在 windowMs 的時間窗口內，允許的最大請求次數。
// 3. Key，用來區分不同 Rate Limit 計數桶（bucket）的識別值。
// 例如:
// IP A → bucket A → 5分鐘 / 20次
// IP B → bucket B → 5分鐘 / 20次
// IP C → bucket C → 5分鐘 / 20次

// 4. Retry-After ，使用者撞到429 Too Many Requests後索回傳的"再請求等待時間"。

// express-rate-limit 預設會使用 request 的 IP 作為 key
// standardHeaders: 使用現代標準 HTTP Rate Limit headers。
// legacyHeaders: false 表示不要再額外產生舊式的：X-RateLimit-* 的headers。

export const loginIpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// 防止大量建立帳號、垃圾註冊
export const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,

  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const refreshRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: env.isProduction ? 5 : 100,

  standardHeaders: "draft-8",
  legacyHeaders: false,
});
