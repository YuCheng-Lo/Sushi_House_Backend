import { httpStatus } from "../constants/constants.js";
import type { MenuItemStatus } from "../generated/prisma/enums.js";
import cloudinary from "../lib/cloudinary.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "../validations/menuItemValidation.js";

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

export const updateMenuItem = async (id: number, data: UpdateMenuItemInput) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id,
    },
  });

  if (!menuItem) {
    throw new AppError("不存在的菜單項目", httpStatus.NOT_FOUND);
  }

  const checkStatus = async (
    oldMenuItemState: MenuItemStatus,
    newMenuItemData: UpdateMenuItemInput,
  ) => {
    if (!newMenuItemData.status) return;

    const sectionStatus = await prisma.section.findUnique({
      where: {
        id: menuItem.sectionId,
      },
      select: {
        status: true,
      },
    });

    if (sectionStatus?.status === "HIDDEN") return;

    if (oldMenuItemState === "ACTIVE" && newMenuItemData.status === "HIDDEN") {
      const menuItemsActiveCount = await prisma.menuItem.count({
        where: {
          sectionId: menuItem.sectionId,
          status: "ACTIVE",
        },
      });

      if (menuItemsActiveCount <= 1) {
        throw new AppError(
          "一個可見的分類中，至少需要保留一個可見菜色",
          httpStatus.BAD_REQUEST,
        );
      }
    }
  };

  await checkStatus(menuItem.status, data);

  const updatedMenuItem = await prisma.menuItem.update({
    where: {
      id,
    },
    data,
  });

  return updatedMenuItem;
};

export const deleteMenuItem = async (id: number) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id,
    },
  });

  if (!menuItem) {
    throw new AppError("不存在的菜單項目", httpStatus.NOT_FOUND);
  }

  const validateDeleteRule = async () => {
    const sectionStatus = await prisma.section.findUnique({
      where: {
        id: menuItem.sectionId,
      },
      select: {
        status: true,
      },
    });

    if (sectionStatus?.status === "HIDDEN" || menuItem.status === "HIDDEN")
      return;

    const menuItemsActiveCount = await prisma.menuItem.count({
      where: {
        sectionId: menuItem.sectionId,
        status: "ACTIVE",
      },
    });

    if (menuItemsActiveCount <= 1) {
      throw new AppError(
        "一個可見的分類中，至少需要保留一個可見菜色",
        httpStatus.BAD_REQUEST,
      );
    }
  };

  await validateDeleteRule();

  try {
    await prisma.menuItem.delete({
      where: {
        id,
      },
    });
  } catch (dbError) {
    console.error("資料庫刪除菜單項目失敗，終止圖片清理:", dbError);
    throw new AppError(
      "資料庫刪除菜單項目失敗，請稍後再試",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (menuItem.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(menuItem.imagePublicId);
    } catch (cloudinaryError) {
      console.error(
        "資料庫刪除成功，但 Cloudinary 圖片清理失敗:",
        cloudinaryError,
      );
    }
  }

  return true;
};
