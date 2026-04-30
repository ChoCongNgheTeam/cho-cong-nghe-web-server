import { Request, Response } from "express";
import * as staffPermissionsService from "./staff-permissions.service";
import { updatePermissionsSchema, resetPermissionsSchema, userIdParamsSchema } from "./staff-permissions.validation";

// ── Admin ──────────────────────────────────────────────────────────────────

/** GET /admin/staff-permissions — danh sách tất cả staff kèm permissions */
export const getAllStaffPermissionsHandler = async (req: Request, res: Response) => {
  const result = await staffPermissionsService.getAllStaffPermissions();
  res.json({
    data: result,
    total: result.length,
    message: "Lấy danh sách permissions nhân viên thành công",
  });
};

/** GET /admin/staff-permissions/:userId — permissions của 1 staff */
export const getStaffPermissionsHandler = async (req: Request, res: Response) => {
  const { userId } = userIdParamsSchema.parse(req.params);
  const result = await staffPermissionsService.getPermissionsByUserId(userId);
  res.json({
    data: result,
    message: "Lấy permissions nhân viên thành công",
  });
};

/** PATCH /admin/staff-permissions/:userId — cập nhật một phần permissions */
export const updateStaffPermissionsHandler = async (req: Request, res: Response) => {
  const { userId } = userIdParamsSchema.parse(req.params);
  const input = updatePermissionsSchema.parse(req.body);
  const result = await staffPermissionsService.updateStaffPermissions(userId, input);
  res.json({
    data: result,
    message: "Cập nhật permissions nhân viên thành công",
  });
};

/** POST /admin/staff-permissions/:userId/reset — reset về preset của role */
export const resetStaffPermissionsHandler = async (req: Request, res: Response) => {
  const { userId } = userIdParamsSchema.parse(req.params);
  const input = resetPermissionsSchema.parse(req.body);
  const result = await staffPermissionsService.resetPermissionsToDefault(userId, input);
  res.json({
    data: result,
    message: `Reset permissions về mặc định của role ${input.role} thành công`,
  });
};
