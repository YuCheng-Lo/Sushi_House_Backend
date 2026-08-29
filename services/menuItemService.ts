import { prisma } from "../lib/prisma.js";
import type { CreateMenuItemInput } from "../validations/menuItemValidation.js";

export const createMenuItem = async (data: CreateMenuItemInput) => {
  const lastMenuItem = await prisma.menuItem.findFirst({
    where: {
      section: data.section,
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
