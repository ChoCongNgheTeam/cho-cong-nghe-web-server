import * as repo from "./warehouse.repository";
import { generateWarehouseCode } from "./warehouse.helpers";
import { CreateWarehouseInput, UpdateWarehouseInput, ListWarehousesQuery } from "./warehouse.validation";
import { NotFoundError, BadRequestError } from "@/errors";

const assertWarehouseExists = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const warehouse = await repo.findById(id, options);
  if (!warehouse) throw new NotFoundError("Kho hàng");
  return warehouse;
};

export const getWarehousesAdmin = async (query: ListWarehousesQuery) => {
  return repo.findAllAdmin(query);
};

// Danh sách rút gọn cho dropdown chọn kho ở các module khác
export const getActiveWarehousesLite = async () => {
  return repo.findAllActiveLite();
};

export const getWarehouseDetail = async (id: string) => {
  return assertWarehouseExists(id, { includeDeleted: true });
};

export const createWarehouse = async (data: CreateWarehouseInput) => {
  let code = data.code?.trim();
  if (code) {
    const exists = await repo.checkCodeExists(code);
    if (exists) throw new BadRequestError("Mã kho đã tồn tại");
  } else {
    // Tự sinh mã, thử lại nếu trùng (xác suất cực thấp)
    do {
      code = generateWarehouseCode();
    } while (await repo.checkCodeExists(code));
  }

  return repo.create({ ...data, code });
};

export const updateWarehouse = async (id: string, data: UpdateWarehouseInput) => {
  await assertWarehouseExists(id);

  if (data.code) {
    const exists = await repo.checkCodeExists(data.code, id);
    if (exists) throw new BadRequestError("Mã kho đã tồn tại");
  }

  // Không cho tắt active kho mặc định — luôn phải có ít nhất 1 kho active để checkout hoạt động
  if (data.isActive === false) {
    const warehouse = await assertWarehouseExists(id);
    if (warehouse.isDefault) {
      const otherActive = await repo.countActiveWarehouses(id);
      if (otherActive === 0) {
        throw new BadRequestError("Không thể vô hiệu hóa kho mặc định khi đây là kho active duy nhất. Hãy tạo/kích hoạt kho khác trước.");
      }
    }
  }

  return repo.update(id, data);
};

export const softDeleteWarehouse = async (id: string, deletedById: string) => {
  const warehouse = await assertWarehouseExists(id);

  const stockRows = await repo.countStockRows(id);
  if (stockRows > 0) {
    throw new BadRequestError(`Không thể xóa kho này vì đang còn ${stockRows} mặt hàng tồn kho > 0. Hãy xuất/chuyển hết hàng trước khi xóa.`);
  }

  if (warehouse.isDefault) {
    const otherActive = await repo.countActiveWarehouses(id);
    if (otherActive === 0) {
      throw new BadRequestError("Không thể xóa kho mặc định duy nhất của hệ thống. Hãy tạo kho khác và đặt làm mặc định trước.");
    }
  }

  return repo.softDelete(id, deletedById);
};

export const restoreWarehouse = async (id: string) => {
  const warehouse = await assertWarehouseExists(id, { includeDeleted: true });
  if (!warehouse.deletedAt) throw new BadRequestError("Kho này chưa bị xóa");

  if (warehouse.code) {
    const codeConflict = await repo.checkCodeExists(warehouse.code, id);
    if (codeConflict) throw new BadRequestError(`Không thể khôi phục vì mã "${warehouse.code}" đã được dùng bởi kho khác`);
  }

  return repo.restore(id);
};

export const setDefaultWarehouse = async (id: string) => {
  const warehouse = await assertWarehouseExists(id);
  if (!warehouse.isActive) throw new BadRequestError("Không thể đặt kho đang bị vô hiệu hóa làm kho mặc định");

  return repo.update(id, { isDefault: true });
};
