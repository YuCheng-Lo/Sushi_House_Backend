import { prisma } from "../lib/prisma.js";
import type { CreateSectionInput } from "../validations/sectionValidation.js";

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
