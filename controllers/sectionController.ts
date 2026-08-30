import type { Request, Response } from "express";
import * as sectionService from "../services/sectionService.js";
import { httpStatus } from "../constants/constants.js";

export const createSection = async (req: Request, res: Response) => {
  const createSectionInput = req.body;

  const result = await sectionService.createSection(createSectionInput);

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "分類新增成功",
    data: result,
  });
};
