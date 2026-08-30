import { httpStatus } from "../constants/constants.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";
import type { CreateMenuItemInput } from "../validations/menuItemValidation.js";

export const createMenuItem = async (data: CreateMenuItemInput) => {
  const section = await prisma.section.findUnique({
    where: {
      id: data.sectionId,
    },
    select: {
      id: true,
    },
  });

  if (!section) {
    throw new AppError("不存在的分類", httpStatus.NOT_FOUND);
  }

  const lastMenuItem = await prisma.menuItem.findFirst({
    where: {
      sectionId: data.sectionId,
    },
    orderBy: {
      sortOrder: "desc",
    },
    select: {
      sortOrder: true,
    },
  });

  const sortOrder = lastMenuItem ? lastMenuItem.sortOrder + 1 : 0;

  const menuItem = await prisma.menuItem.create({
    data: {
      ...data,
      sortOrder,
    },
  });

  return menuItem;
};
