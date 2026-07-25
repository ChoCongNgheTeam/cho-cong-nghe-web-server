import * as repo from "./supplier.repository";
import { generateSupplierCode } from "./supplier.helpers";
import { CreateSupplierInput, UpdateSupplierInput, ListSuppliersQuery } from "./supplier.validation";
import { NotFoundError, BadRequestError } from "@/errors";

const assertSupplierExists = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const supplier = await repo.findById(id, options);
  if (!supplier) throw new NotFoundError("Nhà cung cấp");
  return supplier;
};

export const getSuppliersAdmin = async (query: ListSuppliersQuery) => repo.findAllAdmin(query);

export const getActiveSuppliersLite = async () => repo.findAllActiveLite();

export const getSupplierDetail = async (id: string) => assertSupplierExists(id, { includeDeleted: true });

export const createSupplier = async (data: CreateSupplierInput) => {
  let code = data.code?.trim();
  if (code) {
    const exists = await repo.checkCodeExists(code);
    if (exists) throw new BadRequestError("Mã nhà cung cấp đã tồn tại");
  } else {
    do {
      code = generateSupplierCode();
    } while (await repo.checkCodeExists(code));
  }

  return repo.create({ ...data, code });
};

export const updateSupplier = async (id: string, data: UpdateSupplierInput) => {
  await assertSupplierExists(id);

  if (data.code) {
    const exists = await repo.checkCodeExists(data.code, id);
    if (exists) throw new BadRequestError("Mã nhà cung cấp đã tồn tại");
  }

  return repo.update(id, data);
};

export const softDeleteSupplier = async (id: string, deletedById: string) => {
  await assertSupplierExists(id);
  // Cho phép xóa dù đã có lịch sử nhập hàng (soft delete — không xóa dữ liệu lịch sử stock_movements)
  return repo.softDelete(id, deletedById);
};

export const restoreSupplier = async (id: string) => {
  const supplier = await assertSupplierExists(id, { includeDeleted: true });
  if (!supplier.deletedAt) throw new BadRequestError("Nhà cung cấp này chưa bị xóa");

  if (supplier.code) {
    const codeConflict = await repo.checkCodeExists(supplier.code, id);
    if (codeConflict) throw new BadRequestError(`Không thể khôi phục vì mã "${supplier.code}" đã được dùng bởi nhà cung cấp khác`);
  }

  return repo.restore(id);
};
