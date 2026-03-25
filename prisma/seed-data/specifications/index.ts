import { phoneSpecificationGroups } from "./phone";
import { laptopSpecificationGroups } from "./laptop";
import { gamingLaptopExtraSpecGroups } from "./laptop-gaming-extra";
import { galaxyZExtraSpecGroups } from "./phone-galaxy-z-extra";
import { tiviSpecificationGroups } from "./tivi";
import { mayGiatSpecificationGroups, mayLanhSpecificationGroups, tuLanhSpecificationGroups, maySaySpecificationGroups, tuDongSpecificationGroups } from "./dien-may";
import {
  taiNgheSpecificationGroups,
  loaSpecificationGroups,
  chuotGamingSpecificationGroups,
  banPhimGamingSpecificationGroups,
  phuKienDiDongSpecificationGroups,
  phuKienLaptopSpecificationGroups,
} from "./phu-kien";

/**
 * MAP category slug → danh sách spec groups
 *
 * NGUYÊN TẮC:
 * - Category cha (dien-thoai, laptop...) = spec chung cho toàn bộ con
 * - Category con chỉ được khai báo ở đây nếu có spec KHÁC BIỆT so với cha
 * - Khi seed, script sẽ merge spec cha + spec con cho sản phẩm thuộc cả hai
 *
 * CÁC CATEGORY CON KHÔNG CẦN KHAI BÁO RIÊNG (dùng spec của cha):
 * Phone:   apple-iphone, xiaomi, samsung, oppo
 *          iphone-17/16/15/14/13-series
 *          poco-series, xiaomi-series, redmi-note-series, redmi-series
 *          galaxy-ai, galaxy-s-series, galaxy-a-series, galaxy-m-series, galaxy-xcover
 *          oppo-reno-series, oppo-a-series, oppo-find-series
 *
 * Laptop:  apple-macbook, macbook-air-13/15-inch, macbook-pro-14/16-inch, macbook-m5-series
 *          asus, asus-zenbook, asus-vivobook
 *          lenovo, lenovo-yoga, lenovo-thinkbook, lenovo-thinkpad, lenovo-ideapad, lenovo-gaming-loq
 *          acer, acer-swift, acer-aspire
 *          dell, dell-xps, dell-inspiron, dell-vostro, dell-latitude, dell-15, dell-16
 *          hp, hp-14-15-14s-15s, hp-probook, hp-envy, hp-victus, hp-omen
 *          hp-omnibook-5, hp-omnibook-7, hp-omnibook-u-x
 *
 * Điện máy: tivi-qled, tivi-4k, google-tv
 *            may-giat-cua-truoc, may-giat-cua-tren, may-giat-say
 *            may-lanh-dieu-hoa-1-chieu, may-lanh-dieu-hoa-2-chieu, may-lanh-dieu-hoa-inverter
 *            tu-lanh-inverter, tu-lanh-nhieu-cua, side-by-side, mini
 *            say-thong-hoi, say-ngung-tu, say-bom-nhiet
 *
 * Phụ kiện: tai-nghe-nhet-tai, tai-nghe-chup-tai, tai-nghe-khong-day (→ dùng taiNghe)
 *            loa-bluetooth, loa-karaoke, loa-vi-tinh (→ dùng loa)
 *            bc9f99e3 (tai nghe gaming), 653f95fe (loa gaming) → dùng tai nghe / loa chung
 *            sac-cap, sac-du-phong, bao-da-op-lung, mieng-dan-man-hinh, but-cam-ung
 *            chuot-2, ban-phim-2, balo-tui-xach, but-trinh-chieu, webcam, gia-do, mieng-lot-chuot, hub-chuyen-doi, phu-ban-phim
 */

export const specificationGroupsByCategory = {
  // ================================================================
  // ĐIỆN THOẠI
  // ================================================================
  "dien-thoai": phoneSpecificationGroups,

  // Galaxy Z — foldable: thêm spec màn hình gập & cơ chế gập
  "galaxy-z-series": galaxyZExtraSpecGroups,

  // ================================================================
  // LAPTOP
  // ================================================================
  laptop: laptopSpecificationGroups,

  // Gaming laptops — thêm spec gaming (GPU TDP, cooling, màn hình gaming, bàn phím gaming)
  "asus-rog": gamingLaptopExtraSpecGroups,
  "asus-tuf-gaming": gamingLaptopExtraSpecGroups,
  "lenovo-legion-gaming": gamingLaptopExtraSpecGroups,
  "acer-predator": gamingLaptopExtraSpecGroups,
  "acer-nitro": gamingLaptopExtraSpecGroups,
  "acer-aspire-gaming": gamingLaptopExtraSpecGroups,
  "dell-gaming-g-series": gamingLaptopExtraSpecGroups,

  // ================================================================
  // ĐIỆN MÁY
  // ================================================================
  tivi: tiviSpecificationGroups,
  "may-giat": mayGiatSpecificationGroups,
  "may-lanh-dieu-hoa": mayLanhSpecificationGroups,
  "tu-lanh": tuLanhSpecificationGroups,
  "may-say": maySaySpecificationGroups,
  "tu-dong": tuDongSpecificationGroups,

  // ================================================================
  // PHỤ KIỆN
  // ================================================================

  // Âm thanh
  "tai-nghe-nhet-tai": taiNgheSpecificationGroups,
  "tai-nghe-chup-tai": taiNgheSpecificationGroups,
  "tai-nghe-khong-day": taiNgheSpecificationGroups,
  "loa-bluetooth": loaSpecificationGroups,
  "loa-karaoke": loaSpecificationGroups,
  "loa-vi-tinh": loaSpecificationGroups,

  // Gaming Gear
  chuot: chuotGamingSpecificationGroups, // Gaming gear > Chuột
  "ban-phim": banPhimGamingSpecificationGroups, // Gaming gear > Bàn phím
  "tai-nghe": taiNgheSpecificationGroups, // Gaming gear > Tai nghe
  loa: loaSpecificationGroups, // Gaming gear > Loa

  // Phụ kiện di động
  "phu-kien-di-dong": phuKienDiDongSpecificationGroups,
  "sac-cap": phuKienDiDongSpecificationGroups,
  "sac-du-phong": phuKienDiDongSpecificationGroups,
  "bao-da-op-lung": phuKienDiDongSpecificationGroups,
  "mieng-dan-man-hinh": phuKienDiDongSpecificationGroups,
  "but-cam-ung": phuKienDiDongSpecificationGroups,

  // Phụ kiện laptop
  "phu-kien-laptop": phuKienLaptopSpecificationGroups,
  "chuot-2": chuotGamingSpecificationGroups, // Phụ kiện laptop > Chuột (dùng chung spec chuột)
  "ban-phim-2": banPhimGamingSpecificationGroups, // Phụ kiện laptop > Bàn phím (dùng chung)
  "balo-tui-xach": phuKienLaptopSpecificationGroups,
  "but-trinh-chieu": phuKienLaptopSpecificationGroups,
  webcam: phuKienLaptopSpecificationGroups,
  "gia-do": phuKienLaptopSpecificationGroups,
  "mieng-lot-chuot": phuKienLaptopSpecificationGroups,
  "hub-chuyen-doi": phuKienLaptopSpecificationGroups,
  "phu-ban-phim": phuKienLaptopSpecificationGroups,
} as const;
