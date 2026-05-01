/**
 * product.export.ts
 * Helper tạo file CSV và Excel cho module Products.
 * Tách riêng để tái sử dụng ở bất kỳ module nào khác.
 *
 * Export columns:
 *   id | name | sku (variantCode) | brand | category |
 *   attributes | price | stock | status | isActive | createdAt
 */

import ExcelJS from "exceljs";

// ─── Row type ─────────────────────────────────────────────────────────────────

export interface ExportProductRow {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  brand: string;
  category: string;
  attributes: string; // "Màu: Đen / Dung lượng: 256GB"
  price: number;
  stock: number;
  soldCount: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

// ─── Map raw DB product → export rows (1 product → N variant rows) ────────────

export function mapProductsToExportRows(products: any[]): ExportProductRow[] {
  const rows: ExportProductRow[] = [];

  for (const p of products) {
    const brand = p.brand?.name ?? "—";
    const category = p.category?.name ?? "—";

    const variants: any[] = p.variants ?? [];
    if (variants.length === 0) {
      // Product không có variant → 1 dòng trống
      rows.push({
        productId: p.id,
        productName: p.name,
        variantId: "",
        sku: "",
        brand,
        category,
        attributes: "",
        price: 0,
        stock: 0,
        soldCount: 0,
        isActive: p.isActive,
        isDefault: false,
        createdAt: new Date(p.createdAt).toLocaleDateString("vi-VN"),
      });
      continue;
    }

    for (const v of variants) {
      const attrs = (v.variantAttributes ?? [])
        .map((va: any) => {
          const attrName = va.attributeOption?.attribute?.name ?? va.attributeOption?.attribute?.code ?? "";
          const val = va.attributeOption?.label ?? va.attributeOption?.value ?? "";
          return attrName ? `${attrName}: ${val}` : val;
        })
        .filter(Boolean)
        .join(" / ");

      rows.push({
        productId: p.id,
        productName: p.name,
        variantId: v.id,
        sku: v.code ?? "",
        brand,
        category,
        attributes: attrs,
        price: Number(v.price),
        stock: v.quantity ?? 0,
        soldCount: v.soldCount ?? 0,
        isActive: p.isActive && v.isActive,
        isDefault: v.isDefault,
        createdAt: new Date(p.createdAt).toLocaleDateString("vi-VN"),
      });
    }
  }

  return rows;
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function buildProductCsvBuffer(rows: ExportProductRow[]): Buffer {
  const HEADERS = ["Product ID", "Tên sản phẩm", "Variant ID", "SKU", "Thương hiệu", "Danh mục", "Thuộc tính", "Giá (đ)", "Tồn kho", "Đã bán", "Hoạt động", "Mặc định", "Ngày tạo"];

  const escape = (v: string | number | boolean) => {
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    HEADERS.map(escape).join(","),
    ...rows.map((r) =>
      [r.productId, r.productName, r.variantId, r.sku, r.brand, r.category, r.attributes, r.price, r.stock, r.soldCount, r.isActive ? "Có" : "Không", r.isDefault ? "Có" : "Không", r.createdAt]
        .map(escape)
        .join(","),
    ),
  ];

  return Buffer.concat([Buffer.from("\uFEFF", "utf8"), Buffer.from(lines.join("\r\n"), "utf8")]);
}

// ─── Excel ────────────────────────────────────────────────────────────────────

export async function buildProductExcelBuffer(rows: ExportProductRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Admin Panel";
  wb.created = new Date();

  const ws = wb.addWorksheet("Sản phẩm", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // ── Tiêu đề chính ──────────────────────────────────────────────────────────
  ws.mergeCells("A1:M1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `BÁO CÁO SẢN PHẨM — Xuất lúc ${new Date().toLocaleString("vi-VN")}`;
  titleCell.font = { name: "Arial", bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  // ── Columns config ─────────────────────────────────────────────────────────
  type ColKey = keyof ExportProductRow;
  const COLUMNS: { header: string; key: ColKey; width: number; numFmt?: string }[] = [
    { header: "Product ID", key: "productId", width: 38 },
    { header: "Tên sản phẩm", key: "productName", width: 36 },
    { header: "Variant ID", key: "variantId", width: 38 },
    { header: "SKU", key: "sku", width: 32 },
    { header: "Thương hiệu", key: "brand", width: 16 },
    { header: "Danh mục", key: "category", width: 18 },
    { header: "Thuộc tính", key: "attributes", width: 30 },
    { header: "Giá (đ)", key: "price", width: 16, numFmt: "#,##0" },
    { header: "Tồn kho", key: "stock", width: 12 },
    { header: "Đã bán", key: "soldCount", width: 12 },
    { header: "Hoạt động", key: "isActive", width: 12 },
    { header: "Mặc định", key: "isDefault", width: 12 },
    { header: "Ngày tạo", key: "createdAt", width: 16 },
  ];

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRow = ws.getRow(2);
  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    ws.getColumn(i + 1).width = col.width;
    if (col.numFmt) ws.getColumn(i + 1).numFmt = col.numFmt;
  });
  headerRow.height = 22;

  // ── Data rows ──────────────────────────────────────────────────────────────
  let prevProductId = "";

  rows.forEach((row, idx) => {
    const isNewProduct = row.productId !== prevProductId;
    prevProductId = row.productId;
    const isEven = idx % 2 === 0;

    const values = COLUMNS.map((c) => {
      const v = row[c.key];
      if (typeof v === "boolean") return v ? "✓" : "—";
      return v;
    });

    const r = ws.addRow(values);

    r.eachCell((cell, colIdx) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { vertical: "middle" };

      if (isEven) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }

      // Highlight dòng đầu của mỗi product mới
      if (isNewProduct) {
        cell.border = { top: { style: "thin", color: { argb: "FFE2E8F0" } } };
      }
    });

    // Màu stock thấp (cột 9 = stock)
    const stockCell = r.getCell(9);
    const stock = row.stock;
    if (stock === 0) {
      stockCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFEF4444" } };
    } else if (stock <= 10) {
      stockCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFF97316" } };
    }

    // Màu isActive (cột 11)
    const activeCell = r.getCell(11);
    if (!row.isActive) {
      activeCell.font = { name: "Arial", size: 10, color: { argb: "FF9CA3AF" } };
    } else {
      activeCell.font = { name: "Arial", size: 10, color: { argb: "FF16A34A" } };
    }

    r.height = 18;
  });

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalStock = rows.reduce((s, r) => s + r.stock, 0);
  const totalSold = rows.reduce((s, r) => s + r.soldCount, 0);
  const outOfStock = rows.filter((r) => r.stock === 0).length;

  const summaryRow = ws.addRow([`Tổng: ${rows.length} biến thể`, "", "", "", "", "", "", "", totalStock, totalSold, `Hết hàng: ${outOfStock}`, "", ""]);
  summaryRow.eachCell((cell) => {
    cell.font = { name: "Arial", bold: true, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  });

  // ── Freeze + Filter ────────────────────────────────────────────────────────
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];
  ws.autoFilter = { from: "A2", to: "M2" };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

// ─── Import template (file mẫu để user điền rồi upload lại) ──────────────────

export async function buildImportTemplateBuffer(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Import Template");

  // Hướng dẫn
  ws.mergeCells("A1:F1");
  const guide = ws.getCell("A1");
  guide.value = "📋 HƯỚNG DẪN: Chỉ chỉnh sửa cột PRICE và STOCK. Không thay đổi Variant ID và SKU.";
  guide.font = { name: "Arial", bold: true, size: 11, color: { argb: "FFDC2626" } };
  guide.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF9C3" } };
  ws.getRow(1).height = 24;

  const COLS = [
    { header: "Variant ID *", key: "variantId", width: 38, locked: true },
    { header: "SKU *", key: "sku", width: 28, locked: true },
    { header: "Tên SP", key: "name", width: 30, locked: true },
    { header: "Thuộc tính", key: "attrs", width: 28, locked: true },
    { header: "Giá mới (đ) ✏️", key: "price", width: 18, locked: false },
    { header: "Tồn kho mới ✏️", key: "stock", width: 16, locked: false },
  ];

  const headerRow = ws.getRow(2);
  COLS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: col.locked ? "FF475569" : "FF16A34A" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getColumn(i + 1).width = col.width;
  });
  headerRow.height = 22;

  // Dòng ví dụ
  ws.addRow(["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "IPHONE-16-PRO-256GB-TITAN", "iPhone 16 Pro", "Màu: Titan / Dung lượng: 256GB", 29990000, 50]);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
