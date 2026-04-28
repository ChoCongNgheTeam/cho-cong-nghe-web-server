import { Request, Response } from "express";
import * as service from "./settings.service";
import { groupParamSchema, updateSettingsSchema } from "./settings.validation";

export const getGroupHandler = async (req: Request, res: Response) => {
  const { group } = groupParamSchema.parse(req.params);
  const data = await service.getGroup(group);
  res.json({ data, message: `Lấy cài đặt nhóm "${group}" thành công` });
};

export const getAllHandler = async (_req: Request, res: Response) => {
  const data = await service.getAll();
  res.json({ data, message: "Lấy tất cả cài đặt thành công" });
};

export const updateGroupHandler = async (req: Request, res: Response) => {
  const { group } = groupParamSchema.parse(req.params);
  const input = updateSettingsSchema.parse(req.body);
  const data = await service.updateGroup(group, input, req.user!.id);
  res.json({ data, message: `Cập nhật cài đặt nhóm "${group}" thành công` });
};
