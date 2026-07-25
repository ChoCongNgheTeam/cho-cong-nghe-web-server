import { nanoid } from "nanoid";

// Mã kho tự sinh khi user không nhập, ví dụ: WH-A1B2C3
export const generateWarehouseCode = (): string => `WH-${nanoid(6).toUpperCase()}`;
