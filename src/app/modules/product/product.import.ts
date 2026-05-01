/**
 * product.import.ts
 * Parse file Excel (.xlsx) hoặc CSV upload → validate → bulk update stock/price.
 *
 * Flow:
 *   1. Đọc file buffer (từ multer memory storage)
 *   2. Parse rows → ImportRow[]
 *   3. Validate: variantId hợp lệ UUID, price > 0, stock >= 0
 *   4. Upsert vào DB theo variantId
 *   5. Trả về summary { updated, skipped, errors }
 */

import ExcelJS from "exceljs";
import prisma from "@/config/db";
import { BadRequestError } from "@/errors";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImportRow {
  variantId: string;
  sku?: string;
  price?: number;
  stock?: number;
  /** row number trong file (1-based, tính từ header) */
  rowIndex: number;
}

export interface ImportResult {
  updated: number;
  skipped: number;
  errors: { row: number; variantId: string; reason: string }[];
}

// ─── Parse Excel ──────────────────────────────────────────────────────────────

export async function parseExcelBuffer(buffer: Buffer): Promise<ImportRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);

  // Tìm sheet đầu tiên có dữ liệu
  const ws = wb.worksheets[0];
  if (!ws) throw new BadRequestError("File Excel không có sheet nào");

  const rows: ImportRow[] = [];

  // Tìm header row (row có "Variant ID" hoặc "variantId")
  let headerRowNum = -1;
  let colMap: Record<string, number> = {};

  ws.eachRow((row, rowNum) => {
    if (headerRowNum !== -1) return;

    const values = (row.values as any[]).slice(1);
    const headers = values.map((v) =>
      String(v ?? "")
        .toLowerCase()
        .trim(),
    );

    // FIX: Bỏ qua merged cell row (ExcelJS duplicate cùng 1 giá trị ra nhiều cột)
    const nonEmptyHeaders = headers.filter((h) => h !== "");
    const uniqueHeaders = new Set(nonEmptyHeaders);
    if (uniqueHeaders.size <= 1) return; // merged cell hoặc hàng rỗng

    const variantColIdx = headers.findIndex((h) => h.includes("variant id") || h === "variantid");
    if (variantColIdx !== -1) {
      headerRowNum = rowNum;
      headers.forEach((h, i) => {
        if (h.includes("variant id") || h === "variantid") colMap.variantId = i;
        else if (h.includes("sku")) colMap.sku = i;
        else if (h.includes("giá") || h.includes("price")) colMap.price = i;
        else if (h.includes("tồn kho") || h.includes("stock")) colMap.stock = i;
      });
    }
  });

  if (headerRowNum === -1 || colMap.variantId === undefined) {
    throw new BadRequestError('Không tìm thấy cột "Variant ID" trong file. Hãy dùng file template.');
  }

  ws.eachRow((row, rowNum) => {
    if (rowNum <= headerRowNum) return; // skip header và hướng dẫn

    const vals = (row.values as any[]).slice(1);
    const variantId = String(vals[colMap.variantId] ?? "").trim();
    if (!variantId || variantId === "undefined") return;

    const priceRaw = colMap.price !== undefined ? vals[colMap.price] : undefined;
    const stockRaw = colMap.stock !== undefined ? vals[colMap.stock] : undefined;

    rows.push({
      variantId,
      sku: colMap.sku !== undefined ? String(vals[colMap.sku] ?? "").trim() : undefined,
      price: priceRaw !== undefined && priceRaw !== "" && priceRaw !== null ? Number(priceRaw) : undefined,
      stock: stockRaw !== undefined && stockRaw !== "" && stockRaw !== null ? Math.round(Number(stockRaw)) : undefined,
      rowIndex: rowNum,
    });
  });

  return rows;
}

// ─── Parse CSV ────────────────────────────────────────────────────────────────

export function parseCsvBuffer(buffer: Buffer): ImportRow[] {
  // Strip BOM
  let text = buffer.toString("utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new BadRequestError("File CSV trống hoặc không có dữ liệu");

  // Parse CSV đơn giản (handle quoted fields)
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const idxVariantId = headers.findIndex((h) => h.includes("variant id") || h === "variantid");
  const idxSku = headers.findIndex((h) => h.includes("sku"));
  const idxPrice = headers.findIndex((h) => h.includes("giá") || h.includes("price"));
  const idxStock = headers.findIndex((h) => h.includes("tồn kho") || h.includes("stock"));

  if (idxVariantId === -1) {
    throw new BadRequestError('Không tìm thấy cột "Variant ID". Hãy dùng file template.');
  }

  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const variantId = cols[idxVariantId]?.trim() ?? "";
    if (!variantId) continue;

    rows.push({
      variantId,
      sku: idxSku !== -1 ? cols[idxSku]?.trim() : undefined,
      price: idxPrice !== -1 ? Number(cols[idxPrice]?.replace(/[^0-9.]/g, "") || "") || undefined : undefined,
      stock: idxStock !== -1 ? Math.round(Number(cols[idxStock]?.replace(/[^0-9]/g, "") || "")) || undefined : undefined,
      rowIndex: i + 1,
    });
  }

  return rows;
}

// ─── UUID validator đơn giản ──────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (v: string) => UUID_RE.test(v);

// ─── Main: bulk import ────────────────────────────────────────────────────────

export async function bulkImportVariants(rows: ImportRow[]): Promise<ImportResult> {
  if (rows.length === 0) throw new BadRequestError("File không có dữ liệu nào");
  if (rows.length > 2000) throw new BadRequestError("File quá lớn — tối đa 2000 biến thể mỗi lần import");

  const result: ImportResult = { updated: 0, skipped: 0, errors: [] };

  // Validate + group hợp lệ
  const validRows: ImportRow[] = [];

  for (const row of rows) {
    if (!isUUID(row.variantId)) {
      console.log(row);

      result.errors.push({ row: row.rowIndex, variantId: row.variantId, reason: "Variant ID không hợp lệ (phải là UUID)" });
      continue;
    }

    const hasPrice = row.price !== undefined;
    const hasStock = row.stock !== undefined;

    if (!hasPrice && !hasStock) {
      result.skipped++;
      continue; // không có gì để update
    }

    if (hasPrice && (isNaN(row.price!) || row.price! <= 0)) {
      result.errors.push({ row: row.rowIndex, variantId: row.variantId, reason: `Giá không hợp lệ: ${row.price}` });
      continue;
    }

    if (hasStock && (isNaN(row.stock!) || row.stock! < 0)) {
      result.errors.push({ row: row.rowIndex, variantId: row.variantId, reason: `Tồn kho không hợp lệ: ${row.stock}` });
      continue;
    }

    validRows.push(row);
  }

  if (validRows.length === 0) {
    return result; // không có gì hợp lệ
  }

  // Kiểm tra variants tồn tại trong DB (1 query)
  const variantIds = [...new Set(validRows.map((r) => r.variantId))];
  const existingVariants = await prisma.products_variants.findMany({
    where: { id: { in: variantIds }, deletedAt: null },
    select: { id: true },
  });
  const existingSet = new Set(existingVariants.map((v) => v.id));

  // Batch update — prisma không có updateMany với per-row data
  // → dùng Promise.allSettled theo batch 100
  const BATCH = 100;

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH);

    await Promise.allSettled(
      batch.map(async (row) => {
        if (!existingSet.has(row.variantId)) {
          result.errors.push({ row: row.rowIndex, variantId: row.variantId, reason: "Variant không tồn tại trong hệ thống" });
          return;
        }

        const data: any = {};
        if (row.price !== undefined) data.price = row.price;
        if (row.stock !== undefined) data.quantity = row.stock;

        await prisma.products_variants.update({
          where: { id: row.variantId },
          data,
        });

        result.updated++;
      }),
    );
  }

  return result;
}
