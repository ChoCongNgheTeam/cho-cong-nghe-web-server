import axios from "axios";
import { BadRequestError } from "@/errors";

// ============================================================
// Bài toán: hệ thống hiện chỉ lưu địa chỉ 2 cấp (Tỉnh/Thành + Phường/Xã) theo đơn vị
// hành chính MỚI sau sáp nhập 01/07/2025 (đúng như checkout đang dùng provinces.open-api.vn).
// Nhưng GHN — theo tài liệu API hiện tại (api.ghn.vn/home/docs) — vẫn yêu cầu
// `to_district_id` (number) + `to_ward_code` (string) để tạo đơn, và đây là mã NỘI BỘ
// của GHN theo đơn vị hành chính CŨ (3 cấp: Tỉnh/Huyện/Xã) — không phải mã GSO.
//
// Vì vậy cần 1 chuỗi "dịch" qua 3 bước:
//   1. Xã MỚI (theo tên đang lưu) → tra provinces.open-api.vn v2 để lấy `ward.code` (mã mới)
//   2. Mã xã MỚI → gọi `/api/v2/w/{code}/to-legacies/` để lấy (các) xã CŨ tương ứng
//      kèm district_code (mã huyện CŨ theo GSO)
//   3. Lấy TÊN huyện CŨ từ district_code (API v1), rồi so khớp TÊN đó với danh sách
//      quận/huyện của GHN (`/master-data/district`) để ra được DistrictID của GHN,
//      cuối cùng so khớp tên xã với `/master-data/ward` để ra WardCode của GHN.
//
// Đây là best-effort bằng so khớp tên (không dấu, bỏ tiền tố "Phường/Xã/Quận/Huyện...)
// vì GHN không có mã GSO chuẩn để map trực tiếp. Nếu 1 xã mới gộp từ nhiều xã cũ thuộc
// nhiều huyện khác nhau, hàm sẽ thử lần lượt cho tới khi khớp được với dữ liệu GHN.
//
// Cân nhắc production: nên có bảng cache "provinceName+wardName -> {districtId, wardCode}"
// trong DB (VD thêm vào shipping_providers.config hoặc bảng riêng) để tránh gọi lại
// pipeline này mỗi lần tạo đơn — hiện đang cache tạm bằng in-memory Map (mất khi restart
// server, và KHÔNG share giữa nhiều instance nếu chạy nhiều pod/process).
// ============================================================

const GHN_BASE_URL = process.env.GHN_BASE_URL || "https://online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";
const PROVINCES_API_BASE = "https://provinces.open-api.vn";

const ghnMasterClient = axios.create({
  baseURL: GHN_BASE_URL,
  headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
  timeout: 15000,
});

const provincesApiClient = axios.create({ baseURL: PROVINCES_API_BASE, timeout: 10000 });

// ---- Chuẩn hoá tên hành chính để so khớp: bỏ dấu, hạ chữ thường, bỏ tiền tố ----

const ADMIN_PREFIXES = ["thanh pho truc thuoc trung uong", "thanh pho", "tinh", "quan", "huyen", "thi xa", "phuong", "xa", "thi tran"];

const stripDiacritics = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d");

export const normalizeVnName = (raw: string): string => {
  let s = stripDiacritics(raw.toLowerCase()).trim();
  for (const prefix of ADMIN_PREFIXES) {
    if (s.startsWith(`${prefix} `)) {
      s = s.slice(prefix.length).trim();
      break;
    }
  }
  return s.replace(/\s+/g, " ").trim();
};

// ---- Cache trong bộ nhớ (TTL 6h — dữ liệu hành chính gần như không đổi trong ngày) ----

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
type CacheEntry<T> = { data: T; expiresAt: number };

let ghnProvinceCache: CacheEntry<{ ProvinceID: number; ProvinceName: string }[]> | null = null;
const ghnDistrictCache = new Map<number, CacheEntry<{ DistrictID: number; DistrictName: string }[]>>();
const ghnWardCache = new Map<number, CacheEntry<{ WardCode: string; WardName: string }[]>>();
let provincesV2TreeCache: CacheEntry<any[]> | null = null;

const getGhnProvinces = async () => {
  if (ghnProvinceCache && ghnProvinceCache.expiresAt > Date.now()) return ghnProvinceCache.data;

  const { data } = await ghnMasterClient.get("/master-data/province");
  if (data?.code !== 200) throw new BadRequestError("Không lấy được danh sách tỉnh/thành từ GHN", "GHN_MASTER_DATA_FAILED");

  ghnProvinceCache = { data: data.data, expiresAt: Date.now() + CACHE_TTL_MS };
  return ghnProvinceCache.data;
};

const getGhnDistricts = async (provinceId: number) => {
  const cached = ghnDistrictCache.get(provinceId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const { data } = await ghnMasterClient.post("/master-data/district", { province_id: provinceId });
  if (data?.code !== 200) throw new BadRequestError("Không lấy được danh sách quận/huyện từ GHN", "GHN_MASTER_DATA_FAILED");

  ghnDistrictCache.set(provinceId, { data: data.data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data.data as { DistrictID: number; DistrictName: string }[];
};

const getGhnWards = async (districtId: number) => {
  const cached = ghnWardCache.get(districtId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const { data } = await ghnMasterClient.post("/master-data/ward", { district_id: districtId });
  if (data?.code !== 200) throw new BadRequestError("Không lấy được danh sách phường/xã từ GHN", "GHN_MASTER_DATA_FAILED");

  ghnWardCache.set(districtId, { data: data.data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data.data as { WardCode: string; WardName: string }[];
};

/** Cây tỉnh/xã theo đơn vị hành chính MỚI (v2, 2 cấp) — cache cả nước vì ít khi đổi. */
const getProvincesV2Tree = async () => {
  if (provincesV2TreeCache && provincesV2TreeCache.expiresAt > Date.now()) return provincesV2TreeCache.data;

  const { data } = await provincesApiClient.get("/api/v2/", { params: { depth: 2 } });
  provincesV2TreeCache = { data: data as any[], expiresAt: Date.now() + CACHE_TTL_MS };
  return provincesV2TreeCache.data;
};

/**
 * Dịch xã MỚI -> tên (các) huyện CŨ tương ứng, để có cơ sở so khớp với danh sách
 * quận/huyện nội bộ của GHN (GHN chưa cập nhật theo đơn vị hành chính mới).
 */
const resolveLegacyDistrictNames = async (wardName: string, provinceName: string): Promise<string[]> => {
  const provinceNorm = normalizeVnName(provinceName);
  const wardNorm = normalizeVnName(wardName);

  const tree = await getProvincesV2Tree();
  const province = tree.find((p) => normalizeVnName(p.name) === provinceNorm) ?? tree.find((p) => normalizeVnName(p.name).includes(provinceNorm) || provinceNorm.includes(normalizeVnName(p.name)));
  if (!province) return [];

  const ward = (province.wards || []).find((w: any) => normalizeVnName(w.name) === wardNorm);
  if (!ward) return [];

  const { data: legacies } = await provincesApiClient.get(`/api/v2/w/${ward.code}/to-legacies/`);
  const districtCodes = [...new Set((legacies as any[]).map((l) => l.district_code).filter(Boolean))];

  const districtNames: string[] = [];
  for (const code of districtCodes) {
    try {
      const { data: d } = await provincesApiClient.get(`/api/v1/d/${code}`);
      if (d?.name) districtNames.push(d.name);
    } catch {
      // Bỏ qua nếu 1 mã lỗi — vẫn thử các mã còn lại (xã mới có thể gộp từ nhiều huyện cũ).
    }
  }
  return districtNames;
};

/**
 * Quy đổi (provinceName, wardName) theo đơn vị hành chính MỚI đang lưu trong `orders`
 * thành `{ districtId, wardCode }` nội bộ của GHN — bắt buộc phải có để gọi
 * `/v2/shipping-order/create`.
 */
export const resolveGhnAddressCodes = async (provinceName: string, wardName: string): Promise<{ districtId: number; wardCode: string }> => {
  if (!GHN_TOKEN) {
    throw new BadRequestError("Thiếu GHN_TOKEN để tra cứu master-data địa chỉ", "GHN_MISSING_CONFIG");
  }

  const provinces = await getGhnProvinces();
  const provinceNorm = normalizeVnName(provinceName);
  const province =
    provinces.find((p) => normalizeVnName(p.ProvinceName) === provinceNorm) ??
    provinces.find((p) => normalizeVnName(p.ProvinceName).includes(provinceNorm) || provinceNorm.includes(normalizeVnName(p.ProvinceName)));

  if (!province) {
    throw new BadRequestError(`Không tìm thấy tỉnh/thành "${provinceName}" trong dữ liệu GHN`, "GHN_PROVINCE_NOT_FOUND");
  }

  const legacyDistrictNames = await resolveLegacyDistrictNames(wardName, provinceName);
  const districts = await getGhnDistricts(province.ProvinceID);

  let district = legacyDistrictNames.length ? districts.find((d) => legacyDistrictNames.some((name) => normalizeVnName(d.DistrictName) === normalizeVnName(name))) : undefined;

  // Fallback: xã mới có thể gộp từ nhiều tỉnh/huyện cũ khác nhau khiến bước trên không khớp —
  // quét trực tiếp toàn bộ quận/huyện trong tỉnh để tìm xã theo tên (chậm hơn nhưng chắc ăn hơn).
  if (!district) {
    for (const d of districts) {
      const wards = await getGhnWards(d.DistrictID);
      if (wards.some((w) => normalizeVnName(w.WardName) === normalizeVnName(wardName))) {
        district = d;
        break;
      }
    }
  }

  if (!district) {
    throw new BadRequestError(
      `Không xác định được quận/huyện GHN tương ứng với "${wardName}, ${provinceName}" — có thể cần nhập tay hoặc bổ sung mapping thủ công cho khu vực này.`,
      "GHN_DISTRICT_NOT_FOUND",
    );
  }

  const wards = await getGhnWards(district.DistrictID);
  const ward = wards.find((w) => normalizeVnName(w.WardName) === normalizeVnName(wardName));

  if (!ward) {
    throw new BadRequestError(`Không xác định được mã phường/xã GHN cho "${wardName}"`, "GHN_WARD_NOT_FOUND");
  }

  return { districtId: district.DistrictID, wardCode: ward.WardCode };
};
