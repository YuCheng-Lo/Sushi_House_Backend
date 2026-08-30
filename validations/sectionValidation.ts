import { z } from "zod";

export const createSectionSchema = z.object({
  name: z.string().trim().min(1, "分類不能為空").max(100, "分類最多100字"),
  status: z.enum(["ACTIVE", "HIDDEN"]).optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
