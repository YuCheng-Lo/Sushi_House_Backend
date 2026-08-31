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

  if (data.status === "ACTIVE") {
    throw new AppError("菜單項目建立時不可直接設為顯示中", httpStatus.CONFLICT);
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

export const getMenuItems = async () => {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      status: "ACTIVE",
      section: {
        status: "ACTIVE",
      },
    },
    orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return menuItems;
};
export const getAdminMenuItems = async () => {
  const menuItems = await prisma.menuItem.findMany({
    orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return menuItems;
};
