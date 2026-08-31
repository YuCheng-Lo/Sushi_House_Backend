import { httpStatus } from "../constants/constants.js";
import cloudinary from "../lib/cloudinary.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";
import type {
  CreateSectionInput,
  UpdateSectionInput,
} from "../validations/sectionValidation.js";

export const createSection = async (data: CreateSectionInput) => {
  const lastSection = await prisma.section.findFirst({
    orderBy: {
      sortOrder: "desc",
    },
    select: {
      sortOrder: true,
    },
  });

  const sortOrder = lastSection ? lastSection.sortOrder + 1 : 0;

  const section = await prisma.section.create({
    data: {
      ...data,
      sortOrder,
    },
  });

  return section;
};

export const getSections = async () => {
  const sections = await prisma.section.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return sections;
};

export const getAdminSections = async () => {
  const sections = await prisma.section.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  return sections;
};

export const updateSection = async (id: number, data: UpdateSectionInput) => {
  const section = await prisma.section.findUnique({
    where: {
      id,
    },
  });

  if (!section) {
    throw new AppError("不存在的分類", httpStatus.NOT_FOUND);
  }

  const updatedSection = await prisma.section.update({
    where: {
      id,
    },
    data,
  });

  return updatedSection;
};

export const deleteSection = async (id: number) => {
  const section = await prisma.section.findUnique({
    where: {
      id,
    },
  });

  if (!section) {
    throw new AppError("不存在的分類", httpStatus.NOT_FOUND);
  }

  const deletedMenuItems = await prisma.menuItem.findMany({
    where: {
      sectionId: id,
    },
    select: {
      imagePublicId: true,
    },
  });

  //這個陣列的型別其實是(string | null)[]，故要用filter過濾一下
  //(publicId): publicId is string是 TypeScript 的 type predicate
  //過濾完之後，TS 就知道，publicIdsToDelete是string[]，而不是(string | null)[]
  const publicIdsToDelete = deletedMenuItems
    .map((item) => item.imagePublicId)
    .filter((publicId): publicId is string => publicId !== null);

  try {
    //此Transaction為...目前這個操作本身其實不一定需要顯式 transaction，
    // 因為只有單一 delete operation。
    // 保留它主要是為了統一未來可能擴充成多個 DB 操作時的 transaction 邊界。
    await prisma.$transaction(async (tx) => {
      await tx.section.delete({
        where: {
          id,
        },
      });
    });
  } catch (dbError) {
    console.error("資料庫刪除分類失敗，終止圖片清理:", dbError);
    throw new AppError(
      "資料庫刪除分類失敗，請稍後再試",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (publicIdsToDelete.length > 0) {
    try {
      await cloudinary.api.delete_resources(publicIdsToDelete);
    } catch (cloudinaryError) {
      console.error(
        "資料庫刪除成功，但 Cloudinary 圖片清理失敗:",
        cloudinaryError,
      );
    }
  }

  return true;
};

export const getSectionDeletionImpact = async (id: number) => {
  const section = await prisma.section.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!section) {
    throw new AppError("不存在的分類", httpStatus.NOT_FOUND);
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      sectionId: id,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  return {
    section,
    menuItemCount: menuItems.length,
    menuItems,
  };
};
