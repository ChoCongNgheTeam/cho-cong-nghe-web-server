import { AddressType } from "@prisma/client";

// ==================== INTERFACE ====================

export interface UserAddress {
  id: string;
  userId: string;
  contactName: string;
  phone: string;
  provinceId: string;
  wardId: string;
  detailAddress: string;
  type: AddressType | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddressWithRelations extends UserAddress {
  province: {
    id: string;
    code: string;
    name: string;
    fullName: string;
    type: string;
  };
  ward: {
    id: string;
    code: string;
    name: string;
    fullName: string;
    type: string;
  };
}

export interface CreateAddressInput {
  contactName: string;
  phone: string;
  provinceId: string;
  wardId: string;
  detailAddress: string;
  type?: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  contactName?: string;
  phone?: string;
  provinceId?: string;
  wardId?: string;
  detailAddress?: string;
  type?: AddressType | null;
  isDefault?: boolean;
}

// ==================== RESPONSE TYPES ====================

export interface AddressResponse {
  id: string;
  contactName: string;
  phone: string;
  province: {
    id: string;
    name: string;
    fullName: string;
  };
  ward: {
    id: string;
    name: string;
    fullName: string;
  };
  detailAddress: string;
  fullAddress: string;
  type: AddressType | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Province {
  id: string;
  code: string;
  name: string;
  fullName: string;
  type: string;
}

export interface Ward {
  id: string;
  code: string;
  name: string;
  fullName: string;
  type: string;
}

export interface CreateProvinceInput {
  code: string;
  name: string;
  fullName: string;
  type: string;
}

export interface CreateWardInput {
  code: string;
  name: string;
  fullName: string;
  type: string;
  provinceId: string;
}