import { AddressType } from "@prisma/client";

// ==================== INTERFACES ====================

export interface UserAddress {
  id: string;
  userId: string;
  contactName: string;
  phone: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  detailAddress: string;
  type: AddressType | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  contactName: string;
  phone: string;
  provinceCode: number;
  wardCode: number;
  detailAddress: string;
  type?: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  contactName?: string;
  phone?: string;
  provinceCode?: number;
  wardCode?: number;
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
    code: number;
    name: string;
  };
  ward: {
    code: number;
    name: string;
  };
  detailAddress: string;
  fullAddress: string;
  type: AddressType | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shape trả về từ external Vietnam Provinces API
export interface ExternalProvinceResponse {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  wards?: ExternalWardResponse[];
}

export interface ExternalWardResponse {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}