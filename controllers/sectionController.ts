import type { Request, Response } from "express";
import * as sectionService from "../services/sectionService.js";
import { httpStatus } from "../constants/constants.js";
import type { UpdateSectionInput } from "../validations/sectionValidation.js";
import { success } from "zod";

export const createSection = async (req: Request, res: Response) => {
  const createSectionInput = req.body;

  const result = await sectionService.createSection(createSectionInput);

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "分類新增成功",
    data: result,
  });
};

export const getSections = async (req: Request, res: Response) => {
  const result = await sectionService.getSections();

  return res.status(httpStatus.OK).json({
    success: true,
    message: "分類取得成功",
    data: result,
  });
};

export const getAdminSections = async (req: Request, res: Response) => {
  const result = await sectionService.getAdminSections();

  return res.status(httpStatus.OK).json({
    success: true,
    message: "分類取得成功",
    data: result,
  });
};

export const updateSection = async (
  req: Request<{ id: string }, {}, UpdateSectionInput>,
  res: Response,
) => {
  const id = Number(req.params.id);

  const result = await sectionService.updateSection(id, req.body);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "分類更新成功",
    data: result,
  });
};

export const deleteSection = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  const id = Number(req.params.id);

  await sectionService.deleteSection(id);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "分類已永久刪除",
  });
};

export const getSectionDeletionImpact = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  const id = Number(req.params.id);

  const result = await sectionService.getSectionDeletionImpact(id);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "分類刪除影響成功查詢",
    data: result,
  });
};
