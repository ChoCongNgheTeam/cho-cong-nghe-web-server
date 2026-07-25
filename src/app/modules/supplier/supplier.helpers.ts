import { nanoid } from "nanoid";

export const generateSupplierCode = (): string => `SUP-${nanoid(6).toUpperCase()}`;
