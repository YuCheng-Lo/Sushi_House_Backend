import type { Request, Response } from "express";
import * as menuItemService from "../services/menuItemService.js";
import { httpStatus } from "../constants/constants.js";

export const createMenuItem = async (req: Request, res: Response) => {
  const newMenuItem = req.body;

  const result = await menuItemService.createMenuItem(newMenuItem);

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "菜餚新增成功",
    data: result,
  });
};
