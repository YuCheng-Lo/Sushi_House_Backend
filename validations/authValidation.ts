import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(30),
    nickname: z.string().trim().min(1).max(30).optional(),
    email: z.email(),
    password: z.string().min(8).max(25),
  })
  .refine((data) => !data.nickname || data.nickname !== data.name, {
    message: "暱稱不能與姓名相同",
    path: ["nickname"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
