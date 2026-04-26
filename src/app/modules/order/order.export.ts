/**
 * order.export.ts
 * Helper tạo file CSV và Excel cho module Orders.
 * Tách riêng để các module khác (users, products…) dễ tái sử dụng pattern này.
 */

import ExcelJS from "exceljs";

// ─── Kiểu dữ liệu đầu vào ────────────────────────────────────────────────────

export interface ExportOrderRow {
  orderCode: string;
  orderDate: string; // đã format
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: string; // "iPhone 15 Pro (Titan Đen) x2, ..."
  subtotalAmount: number;
  shippingFee: number;
  voucherDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
}

// ─── Mapping nhãn tiếng Việt ─────────────────────────────────────────────────

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
};

// ─── Helper format từ raw order ──────────────────────────────────────────────

export function mapOrderToExportRow(order: any): ExportOrderRow {
  const items = (order.orderItems ?? [])
    .map((item: any) => {
      const productName = item.productVariant?.product?.name ?? "—";
      const attrs = (item.productVariant?.variantAttributes ?? [])
        .map((va: any) => va.attributeOption?.value ?? "")
        .filter(Boolean)
        .join(", ");
      return `${productName}${attrs ? ` (${attrs})` : ""} x${item.quantity}`;
    })
    .join("; ");

  const address = [order.shippingDetail, order.shippingWard, order.shippingProvince].filter(Boolean).join(", ");

  return {
    orderCode: order.orderCode,
    orderDate: new Date(order.orderDate).toLocaleString("vi-VN"),
    customerName: order.user?.fullName ?? order.shippingContactName ?? "—",
    customerPhone: order.user?.phone ?? order.shippingPhone ?? "—",
    shippingAddress: address,
    items,
    subtotalAmount: Number(order.subtotalAmount),
    shippingFee: Number(order.shippingFee),
    voucherDiscount: Number(order.voucherDiscount),
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.paymentMethod?.name ?? "—",
    orderStatus: ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus,
    paymentStatus: PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus,
  };
}

// ─── Tạo CSV buffer ──────────────────────────────────────────────────────────

export function buildCsvBuffer(rows: ExportOrderRow[]): Buffer {
  const HEADERS = [
    "Mã đơn hàng",
    "Ngày đặt",
    "Khách hàng",
    "SĐT",
    "Địa chỉ giao hàng",
    "Sản phẩm",
    "Tạm tính (đ)",
    "Phí ship (đ)",
    "Giảm giá (đ)",
    "Tổng tiền (đ)",
    "Phương thức TT",
    "Trạng thái đơn",
    "Trạng thái TT",
  ];

  const escape = (v: string | number) => {
    const s = String(v);
    // Wrap trong nháy kép nếu có dấu phẩy, xuống dòng hoặc nháy kép
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    HEADERS.map(escape).join(","),
    ...rows.map((r) =>
      [
        r.orderCode,
        r.orderDate,
        r.customerName,
        r.customerPhone,
        r.shippingAddress,
        r.items,
        r.subtotalAmount,
        r.shippingFee,
        r.voucherDiscount,
        r.totalAmount,
        r.paymentMethod,
        r.orderStatus,
        r.paymentStatus,
      ]
        .map(escape)
        .join(","),
    ),
  ];

  // BOM UTF-8 để Excel Windows hiển thị đúng tiếng Việt
  return Buffer.concat([Buffer.from("\uFEFF", "utf8"), Buffer.from(lines.join("\r\n"), "utf8")]);
}

// ─── Tạo Excel buffer ────────────────────────────────────────────────────────

export async function buildExcelBuffer(rows: ExportOrderRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Admin Panel";
  wb.created = new Date();

  const ws = wb.addWorksheet("Đơn hàng", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // ── Tiêu đề chính ──────────────────────────────────────────────────────────
  ws.mergeCells("A1:M1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `BÁO CÁO ĐƠN HÀNG — Xuất lúc ${new Date().toLocaleString("vi-VN")}`;
  titleCell.font = { name: "Arial", bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  // ── Header row ─────────────────────────────────────────────────────────────
  const COLUMNS: { header: string; key: keyof ExportOrderRow; width: number; numFmt?: string }[] = [
    { header: "Mã đơn hàng", key: "orderCode", width: 22 },
    { header: "Ngày đặt", key: "orderDate", width: 20 },
    { header: "Khách hàng", key: "customerName", width: 24 },
    { header: "SĐT", key: "customerPhone", width: 16 },
    { header: "Địa chỉ giao", key: "shippingAddress", width: 36 },
    { header: "Sản phẩm", key: "items", width: 42 },
    { header: "Tạm tính (đ)", key: "subtotalAmount", width: 16, numFmt: "#,##0" },
    { header: "Phí ship (đ)", key: "shippingFee", width: 14, numFmt: "#,##0" },
    { header: "Giảm giá (đ)", key: "voucherDiscount", width: 14, numFmt: "#,##0" },
    { header: "Tổng tiền (đ)", key: "totalAmount", width: 16, numFmt: "#,##0" },
    { header: "Phương thức TT", key: "paymentMethod", width: 20 },
    { header: "Trạng thái đơn", key: "orderStatus", width: 18 },
    { header: "Trạng thái TT", key: "paymentStatus", width: 18 },
  ];

  const headerRow = ws.getRow(2);
  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
    ws.getColumn(i + 1).width = col.width;
    if (col.numFmt) ws.getColumn(i + 1).numFmt = col.numFmt;
  });
  headerRow.height = 22;

  // ── Data rows ──────────────────────────────────────────────────────────────
  const STATUS_COLOR: Record<string, string> = {
    "Chờ xác nhận": "FFFEF08A", // yellow
    "Đang xử lý": "FFBFDBFE", // blue
    "Đang giao": "FFD1FAE5", // teal
    "Đã giao": "FFBBF7D0", // green
    "Đã hủy": "FFFECACA", // red
  };

  const PAY_STATUS_COLOR: Record<string, string> = {
    "Chưa thanh toán": "FFFEF9C3",
    "Đã thanh toán": "FFBBF7D0",
    "Chờ hoàn tiền": "FFFFE4E6",
    "Đã hoàn tiền": "FFE0E7FF",
  };

  rows.forEach((row, idx) => {
    const r = ws.addRow(COLUMNS.map((c) => row[c.key]));
    const isEven = idx % 2 === 0;

    r.eachCell((cell, colNum) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { vertical: "middle", wrapText: colNum === 6 }; // wrap sản phẩm
      if (isEven) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      }
    });

    // Màu badge trạng thái đơn (cột 12)
    const statusCell = r.getCell(12);
    const statusColor = STATUS_COLOR[row.orderStatus];
    if (statusColor) {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColor } };
      statusCell.alignment = { horizontal: "center", vertical: "middle" };
    }

    // Màu badge trạng thái TT (cột 13)
    const payCell = r.getCell(13);
    const payColor = PAY_STATUS_COLOR[row.paymentStatus];
    if (payColor) {
      payCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: payColor } };
      payCell.alignment = { horizontal: "center", vertical: "middle" };
    }

    r.height = 18;
  });

  // ── Summary row ────────────────────────────────────────────────────────────
  const totalRow = ws.addRow([
    `Tổng cộng: ${rows.length} đơn`,
    "",
    "",
    "",
    "",
    "",
    rows.reduce((s, r) => s + r.subtotalAmount, 0),
    rows.reduce((s, r) => s + r.shippingFee, 0),
    rows.reduce((s, r) => s + r.voucherDiscount, 0),
    rows.reduce((s, r) => s + r.totalAmount, 0),
    "",
    "",
    "",
  ]);
  totalRow.eachCell((cell) => {
    cell.font = { name: "Arial", bold: true, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  });
  totalRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

  // ── Freeze panes ───────────────────────────────────────────────────────────
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];

  // ── Auto filter ────────────────────────────────────────────────────────────
  ws.autoFilter = { from: "A2", to: `M2` };

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
