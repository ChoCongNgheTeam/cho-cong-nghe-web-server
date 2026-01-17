import { AddressType } from "@prisma/client";

export interface UserAddress {
  id: string;
  userId: string;
  contactName: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardId: number | null;
  detailAddress: string;
  type: AddressType | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  contactName: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardId?: number;
  detailAddress: string;
  type?: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  contactName?: string;
  phone?: string;
  provinceId?: number;
  districtId?: number;
  wardId?: number | null;
  detailAddress?: string;
  type?: AddressType | null;
  isDefault?: boolean;
}

export interface AddressResponse extends UserAddress {}
