import { httpStatus } from "../constants/constants.js";
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
