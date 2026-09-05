import { z } from "zod";

const menuItemFields = {
  name: z.string().trim().min(1, "菜名不能為空").max(100, "菜名最多100字"),
  price: z.number().int("價格必須是整數").nonnegative("價格不能小於0"),
  unit: z.string().trim().max(50, "單位最多50字").optional(),
  sectionId: z.number().int("分類 ID 必須是整數").positive("分類 ID 必須大於0"),
  option: z.string().trim().max(100, "選項最多100字").optional(),
  description: z.string().trim().max(5000, "描述過長").optional(),
  imageUrl: z.url("圖片網址格式錯誤").max(500, "圖片網址過長").optional(),
  imagePublicId: z
    .string()
    .trim()
    .min(1, "圖片 Public ID 不能為空")
    .max(255, "圖片 Public ID 過長")
    .optional(),
  status: z.enum(["ACTIVE", "HIDDEN"]).optional(),
};

export const createMenuItemSchema = z
  .object(menuItemFields)
  .refine(
    (data) =>
      (data.imageUrl === undefined && data.imagePublicId === undefined) ||
      (data.imageUrl !== undefined && data.imagePublicId !== undefined),
    {
      message: "imageUrl 與 imagePublicId 必須同時提供",
      path: ["imageUrl"],
    },
  );

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = z.object(menuItemFields).partial();

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

export const menuItemIdSchema = z.object({
  id: z.coerce.number().int("ID 必須為整數").positive("ID 必須為正整數"),
});

export type MenuItemIdInput = z.infer<typeof menuItemIdSchema>;
