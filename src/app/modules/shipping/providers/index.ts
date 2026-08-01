import { ShippingProviderAdapter, ShippingProviderCode } from "../shipping.types";
import { ghnProvider } from "./ghn.provider";
import { ghtkProvider } from "./ghtk.provider";
import { viettelPostProvider } from "./viettelpost.provider";
import { BadRequestError } from "@/errors";

const registry: Record<ShippingProviderCode, ShippingProviderAdapter> = {
  GHN: ghnProvider,
  GHTK: ghtkProvider,
  VTP: viettelPostProvider,
};

export const getProviderAdapter = (code: string): ShippingProviderAdapter => {
  const adapter = registry[code as ShippingProviderCode];
  if (!adapter) {
    throw new BadRequestError(`Không hỗ trợ provider vận chuyển "${code}"`, "SHIPPING_PROVIDER_NOT_SUPPORTED");
  }
  return adapter;
};

export { ghnProvider, ghtkProvider, viettelPostProvider };
