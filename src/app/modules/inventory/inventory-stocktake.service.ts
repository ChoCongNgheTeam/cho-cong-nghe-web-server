import * as stocktakeRepo from "./inventory-stocktake.repository";
import * as warehouseRepo from "../warehouse/warehouse.repository";
import { NotFoundError, BadRequestError } from "@/errors";
import { CreateStocktakeInput, ListStocktakesQuery, UpdateStocktakeItemsInput } from "./inventory.validation";

const resolveWarehouseId = async (warehouseId?: string): Promise<string> => {
  if (warehouseId) return warehouseId;
  const defaultId = await warehouseRepo.getDefaultWarehouseId();
  if (!defaultId) throw new BadRequestError("Chưa có kho hàng nào trong hệ thống. Hãy tạo kho ở mục Danh sách kho trước.");
  return defaultId;
};

const assertStocktakeExists = async (id: string) => {
  const stocktake = await stocktakeRepo.findById(id);
  if (!stocktake) throw new NotFoundError("Phiếu kiểm kê");
  return stocktake;
};

export const getStocktakesAdmin = async (query: ListStocktakesQuery) => stocktakeRepo.findAllAdmin(query);

export const getStocktakeDetail = async (id: string) => assertStocktakeExists(id);

export const createStocktake = async (input: CreateStocktakeInput, createdBy: string) => {
  const warehouseId = await resolveWarehouseId(input.warehouseId);
  return stocktakeRepo.create({ warehouseId, note: input.note, productVariantIds: input.productVariantIds, createdBy });
};

export const updateStocktakeItems = async (id: string, input: UpdateStocktakeItemsInput) => {
  const stocktake = await assertStocktakeExists(id);
  if (!stocktakeRepo.isEditableStatus(stocktake.status)) {
    throw new BadRequestError(`Không thể cập nhật phiếu kiểm kê ở trạng thái "${stocktake.status}"`);
  }
  return stocktakeRepo.updateItems(id, input.items);
};

export const completeStocktake = async (id: string, performedBy: string) => {
  const stocktake = await assertStocktakeExists(id);
  if (!stocktakeRepo.isEditableStatus(stocktake.status)) {
    throw new BadRequestError(`Không thể hoàn tất phiếu kiểm kê ở trạng thái "${stocktake.status}"`);
  }
  const hasCheckedItem = stocktake.items.some((item) => item.actualQuantity !== null);
  if (!hasCheckedItem) throw new BadRequestError("Cần nhập số lượng thực tế cho ít nhất 1 sản phẩm trước khi hoàn tất");

  return stocktakeRepo.complete(id, performedBy);
};

export const cancelStocktake = async (id: string) => {
  const stocktake = await assertStocktakeExists(id);
  if (!stocktakeRepo.isEditableStatus(stocktake.status)) {
    throw new BadRequestError(`Không thể hủy phiếu kiểm kê ở trạng thái "${stocktake.status}"`);
  }
  return stocktakeRepo.cancel(id);
};
