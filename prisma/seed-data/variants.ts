/**
 * VARIANT DATA
 * ============
 * - slug = model sản phẩm, KHÔNG chứa ram/storage
 * - displayCard: true  → render card riêng trên listing page
 *                       (user thấy "OPPO A3 6GB/128GB" và "OPPO A3 8GB/256GB" là 2 card)
 *                       Khi click vào card nào thì vào product detail,
 *                       tất cả variants của product vẫn hiển thị để chọn
 * - displayCard: false → chỉ 1 card, chọn variant bằng selector bên trong
 *                       (như iPhone - chỉ thấy 1 card "iPhone 13", vào trong mới chọn 128/256/512)
 * - isDefault: true    → variant được chọn mặc định khi vào product detail
 *
 * NGUYÊN TẮC:
 *   - Các sản phẩm có RAM khác nhau (OPPO A3 6GB vs 8GB) → displayCard: true
 *   - Các sản phẩm chỉ khác storage/color → displayCard: false, dùng selector
 *   - Model code khác nhau hoàn toàn → product riêng (không gộp)
 */

export const variantData: Record<
  string,
  Array<{
    storage?: string;
    color?: string;
    ram?: string;
    gpu?: string;
    size?: string;
    capacity_cooling?: string;
    price: number;
    isDefault?: boolean;
    displayCard?: boolean;
  }>
> = {
  // ================================================================
  // IPHONE
  // - Không có RAM option (RAM là specification cố định)
  // - Variant: storage + color
  // - displayCard: false → 1 card, chọn storage/color bằng selector
  // ================================================================

  "iphone-13": [
    { storage: "128gb", color: "white", price: 13490000, isDefault: true, displayCard: false },
    { storage: "128gb", color: "orean", price: 13490000, displayCard: false },
    { storage: "128gb", color: "red", price: 13490000, displayCard: false },
    { storage: "128gb", color: "pink", price: 13490000, displayCard: false },
    { storage: "256gb", color: "black", price: 15990000, displayCard: false },
    { storage: "256gb", color: "white", price: 15990000, displayCard: false },
    { storage: "256gb", color: "red", price: 15990000, displayCard: false },
    { storage: "256gb", color: "pink", price: 15990000, displayCard: false },
    { storage: "256gb", color: "alpine-green", price: 16490000, displayCard: false },
    { storage: "512gb", color: "black", price: 18990000, displayCard: false },
  ],

  "iphone-14": [
    { storage: "128gb", color: "black", price: 16990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "black", price: 19990000, displayCard: false },
    { storage: "512gb", color: "black", price: 22990000, displayCard: false },
    { storage: "128gb", color: "white", price: 16990000, displayCard: false },
    { storage: "256gb", color: "white", price: 19990000, displayCard: false },
    { storage: "512gb", color: "white", price: 22990000, displayCard: false },
  ],

  "iphone-15": [
    { storage: "128gb", color: "black", price: 21990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "black", price: 24990000, displayCard: false },
    { storage: "512gb", color: "black", price: 27990000, displayCard: false },
  ],

  "iphone-16": [
    { storage: "128gb", color: "black", price: 26990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "black", price: 29990000, displayCard: false },
    { storage: "512gb", color: "black", price: 32990000, displayCard: false },
  ],

  "iphone-16-plus": [
    { storage: "128gb", color: "black", price: 31990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "black", price: 34990000, displayCard: false },
    { storage: "512gb", color: "black", price: 37990000, displayCard: false },
  ],

  "iphone-16-pro-max": [
    { storage: "128gb", color: "titan-black", price: 39990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "titan-black", price: 42990000, displayCard: false },
    { storage: "512gb", color: "titan-black", price: 45990000, displayCard: false },
  ],

  "iphone-17": [
    { storage: "128gb", color: "black", price: 46990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "black", price: 49990000, displayCard: false },
    { storage: "512gb", color: "black", price: 52990000, displayCard: false },
  ],

  "iphone-17-pro": [
    { storage: "128gb", color: "silver", price: 50990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "silver", price: 53990000, displayCard: false },
    { storage: "512gb", color: "silver", price: 56990000, displayCard: false },
  ],

  "iphone-17-pro-max": [
    { storage: "128gb", color: "orange", price: 53990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "orange", price: 56990000, displayCard: false },
    { storage: "512gb", color: "orange", price: 59990000, displayCard: false },
  ],

  // ================================================================
  // SAMSUNG
  // - Galaxy A/S/Z series có RAM option
  // - displayCard: true khi RAM khác nhau giữa các phiên bản chính
  // ================================================================

  // --- Galaxy A AI Series ---
  // RAM cố định 8GB, chỉ khác storage → displayCard: false
  "samsung-galaxy-a26-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 7490000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 8490000, displayCard: false },
  ],

  "samsung-galaxy-a36-5g": [{ ram: "8gb", storage: "128gb", color: "black", price: 8990000, isDefault: true, displayCard: false }],

  "samsung-galaxy-a56-5g": [{ ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false }],

  // --- Galaxy A Series (phổ thông) ---
  "samsung-galaxy-a06": [
    { ram: "4gb", storage: "64gb", color: "black", price: 3490000, isDefault: true, displayCard: false },
    { ram: "4gb", storage: "128gb", color: "black", price: 3990000, displayCard: false },
  ],

  "samsung-galaxy-a06-5g": [{ ram: "4gb", storage: "128gb", color: "black", price: 4490000, isDefault: true, displayCard: false }],

  // A07: Samsung bán 2 SKU riêng (4GB vs 8GB) với tên model khác nhau
  // → 2 product riêng, mỗi product 1 variant RAM cố định
  "samsung-galaxy-a07": [
    { ram: "4gb", storage: "64gb", color: "black", price: 3290000, isDefault: true, displayCard: false },
    { ram: "4gb", storage: "128gb", color: "black", price: 3690000, displayCard: false },
  ],

  "samsung-galaxy-a07-5g": [{ ram: "4gb", storage: "64gb", color: "black", price: 3990000, isDefault: true, displayCard: false }],

  "samsung-galaxy-a16": [{ ram: "4gb", storage: "128gb", color: "black", price: 4990000, isDefault: true, displayCard: false }],

  "samsung-galaxy-a16-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 6990000, displayCard: false },
  ],

  "samsung-galaxy-a17": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5490000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 6490000, displayCard: false },
  ],

  "samsung-galaxy-a17-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 6490000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 7490000, displayCard: false },
  ],

  "samsung-galaxy-m55-5g": [{ ram: "8gb", storage: "256gb", color: "black", price: 8990000, isDefault: true, displayCard: false }],

  "samsung-galaxy-xcover7-pro-5g": [{ ram: "6gb", storage: "128gb", color: "black", price: 12990000, isDefault: true, displayCard: false }],

  // --- Galaxy S FE ---
  "samsung-galaxy-s24-fe-5g": [
    { storage: "128gb", color: "black", price: 12990000, isDefault: true, displayCard: false },
    { storage: "256gb", color: "black", price: 13990000, displayCard: false },
  ],

  "samsung-galaxy-s25-fe-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 14990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 16490000, displayCard: false },
  ],

  // --- Galaxy S25 Series ---
  "samsung-galaxy-s25-edge-5g": [
    { storage: "256gb", color: "black", price: 19990000, isDefault: true, displayCard: false },
    { storage: "512gb", color: "black", price: 22990000, displayCard: false },
  ],

  "samsung-galaxy-s25-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 21990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 24990000, displayCard: false },
  ],

  "samsung-galaxy-s25-plus-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 25990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 28990000, displayCard: false },
  ],

  "samsung-galaxy-s25-ultra-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 31990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 34990000, displayCard: false },
    { ram: "12gb", storage: "1tb", color: "black", price: 38990000, displayCard: false },
  ],

  // --- Galaxy S24 Ultra ---
  "samsung-galaxy-s24-ultra-5g": [
    { storage: "256gb", color: "black", price: 23990000, isDefault: true, displayCard: false },
    { storage: "512gb", color: "black", price: 26990000, displayCard: false },
  ],

  // --- Galaxy Z Series ---
  "samsung-galaxy-z-fold6-5g": [
    { storage: "256gb", color: "black", price: 34990000, isDefault: true, displayCard: false },
    { storage: "512gb", color: "black", price: 38490000, displayCard: false },
  ],

  "samsung-galaxy-z-fold7-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 40990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 44990000, displayCard: false },
  ],

  "samsung-galaxy-z-flip7-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 25990000, isDefault: true, displayCard: false }],

  // ================================================================
  // OPPO
  // - Các model có RAM khác nhau → gộp 1 product, displayCard: true
  // - Các model chỉ khác storage → displayCard: false
  // ================================================================

  // --- Reno Series ---
  // RAM cố định trong từng model → displayCard: false
  "oppo-reno11-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  "oppo-reno12-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  "oppo-reno13-f-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  "oppo-reno14-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  "oppo-reno14-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  "oppo-reno15-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  "oppo-reno15-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  // --- A Series ---
  // oppo-a3: CÓ 2 phiên bản RAM khác nhau → gộp lại, displayCard: true
  // User thấy 2 card: "OPPO A3 6GB/128GB" và "OPPO A3 8GB/256GB"
  // Vào card nào cũng thấy đủ 2 variant để chọn
  "oppo-a3": [
    { ram: "6gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: true },
  ],

  // oppo-a5i: CÓ 2 phiên bản RAM khác nhau → gộp lại, displayCard: true
  "oppo-a5i": [
    { ram: "4gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: true },
    { ram: "6gb", storage: "128gb", color: "black", price: 10990000, displayCard: true },
  ],

  // oppo-a6t: CÓ 2 phiên bản RAM khác nhau → gộp lại, displayCard: true
  "oppo-a6t": [
    { ram: "4gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: true },
    { ram: "6gb", storage: "256gb", color: "black", price: 12990000, displayCard: true },
  ],

  // oppo-a5i-pro: 1 phiên bản duy nhất
  "oppo-a5i-pro": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  // oppo-a6-pro: 1 phiên bản RAM duy nhất
  "oppo-a6-pro": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  // oppo-a18: 1 phiên bản RAM duy nhất
  "oppo-a18": [
    { ram: "4gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: false },
    { ram: "4gb", storage: "256gb", color: "black", price: 12990000, displayCard: false },
  ],

  // oppo-a58: CÓ 2 phiên bản RAM khác nhau → gộp lại, displayCard: true
  "oppo-a58": [
    { ram: "6gb", storage: "128gb", color: "black", price: 10990000, isDefault: true, displayCard: true },
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, displayCard: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000, displayCard: true },
  ],

  // --- Find Series ---
  "oppo-find-x9-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: true },
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, displayCard: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000, displayCard: true },
  ],

  "oppo-find-x9-pro-5g": [
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  "oppo-find-n5-5g": [
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  "oppo-find-n3-5g": [
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  // ================================================================
  // XIAOMI
  // ================================================================

  // --- POCO Series ---
  "xiaomi-poco-c71": [{ ram: "4gb", storage: "128gb", color: "black", price: 2990000, isDefault: true, displayCard: false }],

  "xiaomi-poco-m6-pro": [
    { ram: "8gb", storage: "128gb", color: "black", price: 4490000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 4990000, displayCard: false },
  ],

  "xiaomi-poco-m7-pro-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5490000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 6290000, displayCard: false },
  ],

  "xiaomi-poco-x7-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 7990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 8990000, displayCard: false },
  ],

  "xiaomi-poco-f8-pro-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000, displayCard: false },
  ],

  // --- Redmi Series ---
  "xiaomi-redmi-14c": [{ ram: "4gb", storage: "128gb", color: "black", price: 2890000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-13x": [{ ram: "8gb", storage: "128gb", color: "black", price: 3490000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-15-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5990000, isDefault: true, displayCard: false },
    { ram: "8gb", storage: "256gb", color: "black", price: 6790000, displayCard: false },
  ],

  // --- Redmi Note Series ---
  "xiaomi-redmi-note-14": [{ ram: "6gb", storage: "128gb", color: "black", price: 3990000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-note-14-5g": [{ ram: "8gb", storage: "128gb", color: "black", price: 4990000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-note-14-pro-plus-5g": [{ ram: "8gb", storage: "256gb", color: "black", price: 7990000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-note-15": [{ ram: "6gb", storage: "128gb", color: "black", price: 5490000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-note-15-5g": [{ ram: "6gb", storage: "128gb", color: "black", price: 6490000, isDefault: true, displayCard: false }],

  "xiaomi-redmi-note-15-pro": [
    { ram: "12gb", storage: "256gb", color: "black", price: 7990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 8990000, displayCard: false },
  ],

  "xiaomi-redmi-note-15-pro-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 9990000, isDefault: true, displayCard: false },
    { ram: "12gb", storage: "512gb", color: "black", price: 11490000, displayCard: false },
  ],

  "xiaomi-15-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 9990000, isDefault: true, displayCard: false }],

  "xiaomi-15-ultra-5g": [{ ram: "16gb", storage: "512gb", color: "black", price: 14990000, isDefault: true, displayCard: false }],

  "xiaomi-15t-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 9990000, isDefault: true, displayCard: false }],

  "xiaomi-15t-pro-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 12990000, isDefault: true, displayCard: false }],

  // ================================================================
  // MACBOOK AIR
  // - Variant: ram + storage + gpu
  // - displayCard: true khi RAM khác nhau (13 M4 có 16GB vs 24GB)
  // ================================================================

  "macbook-air-13-m4": [
    { ram: "16gb", storage: "256gb", gpu: "8core", color: "black", price: 15990000, isDefault: true, displayCard: true },
    { ram: "16gb", storage: "512gb", gpu: "10core", color: "black", price: 18990000, displayCard: true },
    { ram: "24gb", storage: "512gb", gpu: "10core", color: "black", price: 20990000, displayCard: true },
  ],

  // 1 cấu hình duy nhất → displayCard: false
  "macbook-air-13-m2": [{ ram: "16gb", storage: "256gb", gpu: "8core", color: "black", price: 15990000, isDefault: true, displayCard: false }],

  "macbook-air-15-m4": [
    { ram: "16gb", storage: "256gb", gpu: "10core", color: "black", price: 19990000, isDefault: true, displayCard: false },
    { ram: "16gb", storage: "512gb", gpu: "10core", color: "black", price: 21990000, displayCard: false },
  ],

  "macbook-air-15-m2": [{ ram: "8gb", storage: "512gb", gpu: "10core", color: "black", price: 21990000, isDefault: true, displayCard: false }],

  // ================================================================
  // MACBOOK PRO
  // - displayCard: true khi có nhiều cấu hình RAM khác nhau
  // ================================================================

  "macbook-pro-14-m4-pro": [
    { ram: "24gb", storage: "512gb", gpu: "16core", color: "black", price: 23990000, isDefault: true, displayCard: true },
    { ram: "24gb", storage: "1tb", gpu: "20core", color: "black", price: 25990000, displayCard: true },
  ],

  "macbook-pro-14-m3-pro": [{ ram: "18gb", storage: "1tb", gpu: "18core", color: "black", price: 27990000, isDefault: true, displayCard: false }],

  "macbook-pro-14-m4-max": [{ ram: "36gb", storage: "1tb", gpu: "32core", color: "black", price: 29990000, isDefault: true, displayCard: false }],

  "macbook-pro-14-m5": [
    { ram: "16gb", storage: "512gb", gpu: "10core", color: "black", price: 31990000, isDefault: true, displayCard: true },
    { ram: "24gb", storage: "512gb", gpu: "10core", color: "black", price: 33990000, displayCard: true },
  ],

  "macbook-pro-16-m4-pro": [
    { ram: "24gb", storage: "512gb", gpu: "20core", color: "black", price: 35990000, isDefault: true, displayCard: true },
    { ram: "48gb", storage: "512gb", gpu: "20core", color: "black", price: 37990000, displayCard: true },
  ],

  "macbook-pro-16-m4-max": [
    { ram: "36gb", storage: "1tb", gpu: "32core", color: "black", price: 39990000, isDefault: true, displayCard: true },
    { ram: "48gb", storage: "1tb", gpu: "40core", color: "black", price: 41990000, displayCard: true },
  ],

  // ================================================================
  // MÁY LẠNH / ĐIỀU HÒA
  // - Comfee CFS-13VGP và CFS-18VGP là 2 model code khác nhau
  //   → 2 product riêng, name/slug lưu cứng theo model
  //   → mỗi product chỉ có 1 variant duy nhất (chỉ chọn màu nếu có)
  // - Casper tương tự: mỗi model code là 1 product riêng
  // ================================================================

  // Comfee Inverter 1.5 HP CFS-13VGP → product riêng, 1 variant
  "comfee-inverter-cfs-13vgp": [{ color: "white", price: 20990000, isDefault: true, displayCard: false }],

  // Casper 1.5 HP GC-12IB36 → product riêng
  "casper-inverter-gc-12ib36": [{ color: "white", price: 21990000, isDefault: true, displayCard: false }],

  // Casper 1 HP TC-09IS35 → product riêng
  "casper-inverter-tc-09is35": [{ color: "white", price: 22990000, isDefault: true, displayCard: false }],

  // Casper 1.5 HP GC-12IS35 → product riêng
  "casper-inverter-gc-12is35": [{ color: "white", price: 23990000, isDefault: true, displayCard: false }],

  // ================================================================
  // TAI NGHE / EARPODS
  // - Variant: connection (USB-C vs Lightning là 2 product riêng vì
  //   Apple đặt tên model khác nhau)
  // - AirPods Pro: 1 model, chỉ có màu
  // ================================================================

  // EarPods USB-C → product riêng (khác model với Lightning)
  "apple-earpods-usb-c": [{ color: "white", price: 690000, isDefault: true, displayCard: false }],

  // EarPods Lightning → product riêng
  "apple-earpods-lightning": [{ color: "white", price: 590000, isDefault: true, displayCard: false }],

  // AirPods Pro 3
  "apple-airpods-pro-3": [{ color: "white", price: 6990000, isDefault: true, displayCard: false }],

  "apple-earpods-lightning-mmtn2za": [{ color: "white", price: 590000, isDefault: true, displayCard: false }],
};

// ================================================================
// HELPER: Build display name từ product name + variant attributes
// Dùng ở UI layer khi render product card hoặc breadcrumb
//
// Ví dụ:
//   buildDisplayName("OPPO A3", { ram: "6gb", storage: "128gb" })
//   → "OPPO A3 6GB/128GB"
//
//   buildDisplayName("MacBook Air 13 M4", { ram: "16gb", storage: "256gb", gpu: "8core" })
//   → "MacBook Air 13 M4 16GB/256GB 8-core GPU"
//
//   buildDisplayName("iPhone 13", { storage: "128gb", color: "black" })
//   → "iPhone 13 128GB"  (color không nối vào name, chỉ dùng cho selector)
// ================================================================
export function buildDisplayName(
  productName: string,
  variant: {
    ram?: string;
    storage?: string;
    gpu?: string;
    capacity_cooling?: string;
  },
): string {
  const parts: string[] = [productName];

  if (variant.ram) parts.push(variant.ram.toUpperCase());
  if (variant.storage) parts.push(variant.storage.toUpperCase());
  if (variant.gpu) {
    // "8core" → "8-core GPU"
    parts.push(variant.gpu.replace("core", "-core GPU"));
  }
  if (variant.capacity_cooling) {
    // "1-5hp" → "1.5HP"
    parts.push(variant.capacity_cooling.replace("-", ".").toUpperCase());
  }

  return parts.join(" ");
}

export const variantImages: Record<string, Record<string, string[]>> = {
  "iphone-13": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/black/image-0${i + 1}.webp`),
    white: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/white/image-0${i + 1}.webp`),
    red: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/red/image-0${i + 1}.webp`),
    pink: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/pink/image-0${i + 1}.webp`),
    blue: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/blue/image-0${i + 1}.webp`),
    "alpine-green": Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/alpine-green/image-0${i + 1}.webp`),
  },

  "iphone-14": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-14/black/image-0${i + 1}.webp`),
  },

  "iphone-15": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-15/black/image-0${i + 1}.webp`),
  },

  "iphone-16": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-16/black/image-0${i + 1}.webp`),
  },

  "iphone-16-plus": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-16-plus/black/image-0${i + 1}.webp`),
  },

  "iphone-16-pro-max": {
    "titan-black": Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-16-pro-max/titan-black/image-0${i + 1}.webp`),
  },

  "iphone-17": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-17/black/image-0${i + 1}.webp`),
  },

  "iphone-17-pro": {
    silver: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-17-pro/silver/image-0${i + 1}.webp`),
  },

  "iphone-17-pro-max": {
    orange: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-17-pro-max/orange/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-z-fold7-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-z-fold7-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-z-flip7-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-z-flip7-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-z-fold6-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-z-fold6-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-a56-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-a56-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-a36-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-a36-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s25-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-ultra-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s25-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s25-plus-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-plus-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s25-fe-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-fe-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-a26-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-a26-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s24-fe-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s24-fe-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s25-edge-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-edge-5g/black/image-0${i + 1}.webp`),
  },
  "samsung-galaxy-s24-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s24-ultra-5g/black/image-0${i + 1}.webp`),
  },

  // OPPO
  "oppo-reno15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno15-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-reno15-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno15-f-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-reno14-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno14-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-reno14-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno14-f-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-reno13-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno13-f-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-reno12-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno12-f-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-reno11-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno11-f-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-a6-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a6-pro/black/image-0${i + 1}.webp`),
  },
  "oppo-a5i-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a5i-pro/black/image-0${i + 1}.webp`),
  },
  "oppo-a6t": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a6t/black/image-0${i + 1}.webp`),
  },
  "oppo-a5i": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a5i/black/image-0${i + 1}.webp`),
  },
  "oppo-a3": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a3/black/image-0${i + 1}.webp`),
  },
  "oppo-a58": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a58/black/image-0${i + 1}.webp`),
  },
  "oppo-a18": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a18/black/image-0${i + 1}.webp`),
  },
  "oppo-find-x9-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-x9-pro-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-find-x9-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-x9-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-find-n5-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-n5-5g/black/image-0${i + 1}.webp`),
  },
  "oppo-find-n3-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-n3-5g/black/image-0${i + 1}.webp`),
  },

  // XIAOMI
  "xiaomi-poco-f8-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-f8-pro-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-poco-x7-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-x7-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-poco-m7-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-m7-pro-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-poco-m6-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-m6-pro/black/image-0${i + 1}.webp`),
  },
  "xiaomi-poco-c71": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-c71/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-note-15-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-15-pro-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-note-15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-15-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-note-15": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-15/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-note-14-pro-plus-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-14-pro-plus-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-note-14-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-14-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-note-14": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-14/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-15-5g/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-14c": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-14c/black/image-0${i + 1}.webp`),
  },
  "xiaomi-redmi-13x": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-13x/black/image-0${i + 1}.webp`),
  },

  // --- MACBOOK AIR ---
  "macbook-air-13-m4": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-13-m4/black/image-0${i + 1}.webp`),
  },
  "macbook-air-13-m2": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-13-m2/black/image-0${i + 1}.webp`),
  },
  "macbook-air-15-m4": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-15-m4/black/image-0${i + 1}.webp`),
  },
  "macbook-air-15-m2": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-15-m2/black/image-0${i + 1}.webp`),
  },

  // --- MACBOOK PRO ---
  "macbook-pro-14-m4-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-m4-pro/black/image-0${i + 1}.webp`),
  },
  "macbook-pro-14-m3-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-m3-pro/black/image-0${i + 1}.webp`),
  },
  "macbook-pro-14-m4-max": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-m4-max/black/image-0${i + 1}.webp`),
  },
  "macbook-pro-14-m5": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-m5/black/image-0${i + 1}.webp`),
  },
  "macbook-pro-16-m4-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-16-m4-pro/black/image-0${i + 1}.webp`),
  },
  "macbook-pro-16-m4-max": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-16-m4-max/black/image-0${i + 1}.webp`),
  },

  // --- AIR CONDITIONER ---
  "comfee-inverter-cfs-13vgp": {
    black: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/comfee-inverter-cfs-13vgp/black/image-0${i + 1}.webp`),
  },
  "casper-inverter-gc-12ib36": {
    black: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/casper-inverter-gc-12ib36/black/image-0${i + 1}.webp`),
  },
  "casper-inverter-tc-09is35": {
    black: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/casper-inverter-tc-09is35/black/image-0${i + 1}.webp`),
  },
  "casper-inverter-gc-12is35": {
    black: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/casper-inverter-gc-12is35/black/image-0${i + 1}.webp`),
  },

  // --- HEADPHONES ---
  "apple-earpods-usb-c": {
    black: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-earpods-usb-c/black/image-0${i + 1}.webp`),
  },
  "apple-earpods-lightning": {
    black: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-earpods-lightning/black/image-0${i + 1}.webp`),
  },
  "apple-airpods-pro-3": {
    black: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-airpods-pro-3/black/image-0${i + 1}.webp`),
  },
};
