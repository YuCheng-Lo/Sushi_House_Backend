import type { Request, Response } from "express";
import * as menuItemService from "../services/menuItemService.js";
import { httpStatus } from "../constants/constants.js";
import type { UpdateMenuItemInput } from "../validations/menuItemValidation.js";

export const createMenuItem = async (req: Request, res: Response) => {
  const newMenuItem = req.body;

  const result = await menuItemService.createMenuItem(newMenuItem);

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "菜單項目新增成功",
    data: result,
  });
};

export const getMenuItems = async (req: Request, res: Response) => {
  const result = await menuItemService.getMenuItems();

  return res.status(httpStatus.OK).json({
    success: true,
    message: "菜單項目取得成功",
    data: result,
  });
};

export const getAdminMenuItems = async (req: Request, res: Response) => {
  const result = await menuItemService.getAdminMenuItems();

  return res.status(httpStatus.OK).json({
    success: true,
    message: "菜單項目取得成功",
    data: result,
  });
};

export const updateMenuItem = async (
  req: Request<{ id: string }, {}, UpdateMenuItemInput>,
  res: Response,
) => {
  const id = Number(req.params.id);

  const result = await menuItemService.updateMenuItem(id, req.body);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "菜單項目更新成功",
    data: result,
  });
};
