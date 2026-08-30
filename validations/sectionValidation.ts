import { z } from "zod";

export const createSectionSchema = z.object({
  name: z.string().trim().min(1, "分類不能為空").max(100, "分類最多100字"),
  status: z.enum(["ACTIVE", "HIDDEN"]).optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = createSectionSchema.partial();

export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

export const sectionIdSchema = z.object({
  id: z.coerce.number().int("ID 必須為整數").positive("ID 必須為正整數"),
});

export type SectionIdInput = z.infer<typeof sectionIdSchema>;
