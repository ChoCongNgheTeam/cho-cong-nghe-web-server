/**
 * Helper tạo file CSV và Excel cho module Users.
 * Tách riêng để tái sử dụng.
 *
 * Export columns:
 *   id | fullName | userName | email | phone | role |
 *   gender | isActive | createdAt | orderCount | totalSpent
 */

import ExcelJS from "exceljs";

// ─── Row type ─────────────────────────────────────────────────────────────────

export interface ExportUserRow {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

// ─── Mapping nhãn ─────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

// ─── Map raw DB user → export row ─────────────────────────────────────────────

export function mapUsersToExportRows(users: any[], orderStatsMap: Map<string, { orderCount: number; totalSpent: number }> = new Map()): ExportUserRow[] {
  return users.map((u) => {
    const stats = orderStatsMap.get(u.id) ?? { orderCount: 0, totalSpent: 0 };
    return {
      id: u.id,
      fullName: u.fullName ?? "—",
      userName: u.userName ?? "—",
      email: u.email ?? "—",
      phone: u.phone ?? "—",
      role: ROLE_LABEL[u.role] ?? u.role ?? "—",
      gender: GENDER_LABEL[u.gender ?? ""] ?? "—",
      isActive: u.isActive ?? false,
      createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—",
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent,
    };
  });
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function buildUserCsvBuffer(rows: ExportUserRow[]): Buffer {
  const HEADERS = ["ID", "Họ tên", "Username", "Email", "Số điện thoại", "Vai trò", "Giới tính", "Trạng thái", "Ngày tạo", "Số đơn hàng", "Tổng chi tiêu (đ)"];

  const escape = (v: string | number | boolean) => {
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    HEADERS.map(escape).join(","),
    ...rows.map((r) => [r.id, r.fullName, r.userName, r.email, r.phone, r.role, r.gender, r.isActive ? "Hoạt động" : "Bị khóa", r.createdAt, r.orderCount, r.totalSpent].map(escape).join(",")),
  ];

  return Buffer.concat([Buffer.from("\uFEFF", "utf8"), Buffer.from(lines.join("\r\n"), "utf8")]);
}

// ─── Excel ────────────────────────────────────────────────────────────────────

export async function buildUserExcelBuffer(rows: ExportUserRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Admin Panel";
  wb.created = new Date();

  const ws = wb.addWorksheet("Người dùng", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // ── Tiêu đề chính ──────────────────────────────────────────────────────────
  ws.mergeCells("A1:K1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `BÁO CÁO NGƯỜI DÙNG — Xuất lúc ${new Date().toLocaleString("vi-VN")}`;
  titleCell.font = { name: "Arial", bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  // ── Columns ────────────────────────────────────────────────────────────────
  type ColKey = keyof ExportUserRow;
  const COLUMNS: { header: string; key: ColKey; width: number; numFmt?: string }[] = [
    { header: "ID", key: "id", width: 38 },
    { header: "Họ tên", key: "fullName", width: 26 },
    { header: "Username", key: "userName", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Số điện thoại", key: "phone", width: 16 },
    { header: "Vai trò", key: "role", width: 18 },
    { header: "Giới tính", key: "gender", width: 12 },
    { header: "Trạng thái", key: "isActive", width: 14 },
    { header: "Ngày tạo", key: "createdAt", width: 14 },
    { header: "Số đơn hàng", key: "orderCount", width: 14 },
    { header: "Tổng chi tiêu (đ)", key: "totalSpent", width: 20, numFmt: "#,##0" },
  ];

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRow = ws.getRow(2);
  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8B5CF6" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    ws.getColumn(i + 1).width = col.width;
    if (col.numFmt) ws.getColumn(i + 1).numFmt = col.numFmt;
  });
  headerRow.height = 22;

  // ── Role colors ────────────────────────────────────────────────────────────
  const ROLE_COLOR: Record<string, string> = {
    "Quản trị viên": "FFE9D5FF", // purple
    "Nhân viên": "FFDBEAFE", // blue
    "Khách hàng": "FFD1FAE5", // green
  };

  // ── Data rows ──────────────────────────────────────────────────────────────
  rows.forEach((row, idx) => {
    const values = COLUMNS.map((c) => {
      const v = row[c.key];
      if (c.key === "isActive") return v ? "✓ Hoạt động" : "✗ Bị khóa";
      return v;
    });

    const r = ws.addRow(values);
    const isEven = idx % 2 === 0;

    r.eachCell((cell) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { vertical: "middle" };
      if (isEven) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      }
    });

    // Màu cột Vai trò (cột 6)
    const roleCell = r.getCell(6);
    const roleColor = ROLE_COLOR[row.role];
    if (roleColor) {
      roleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: roleColor } };
      roleCell.alignment = { horizontal: "center", vertical: "middle" };
    }

    // Màu cột Trạng thái (cột 8)
    const statusCell = r.getCell(8);
    if (row.isActive) {
      statusCell.font = { name: "Arial", size: 10, color: { argb: "FF16A34A" } };
    } else {
      statusCell.font = { name: "Arial", size: 10, color: { argb: "FFEF4444" } };
    }
    statusCell.alignment = { horizontal: "center", vertical: "middle" };

    r.height = 18;
  });

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalOrders = rows.reduce((s, r) => s + r.orderCount, 0);
  const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0);
  const activeCount = rows.filter((r) => r.isActive).length;

  const summaryRow = ws.addRow([`Tổng: ${rows.length} người dùng (${activeCount} hoạt động)`, "", "", "", "", "", "", "", "", totalOrders, totalSpent]);
  summaryRow.eachCell((cell) => {
    cell.font = { name: "Arial", bold: true, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  });

  // ── Freeze + Filter ────────────────────────────────────────────────────────
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];
  ws.autoFilter = { from: "A2", to: "K2" };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
