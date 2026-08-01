// Cần cài thêm: npm install pdfkit @types/pdfkit
// (Repo hiện chưa có lib PDF nào phù hợp cho việc vẽ layout tự do như phiếu vận đơn —
//  exceljs chỉ dùng cho export Excel, không vẽ được PDF.)
import PDFDocument from "pdfkit";

type LabelShipment = {
  providerOrderCode: string | null;
  provider: { code: string; name: string };
  order: {
    orderCode: string;
    shippingContactName: string;
    shippingPhone: string;
    shippingProvince: string;
    shippingWard: string;
    shippingDetail: string;
    totalAmount: any;
    paymentStatus: string;
    orderItems: Array<{
      quantity: number;
      productVariant: { code: string | null; product: { name: string } };
    }>;
  };
};

/**
 * Vẽ 1 phiếu vận đơn khổ A6 (giống khổ in nhiệt phổ biến của GHN/GHTK/VTP).
 * Mỗi shipment ra 1 trang riêng trong cùng 1 file PDF để in hàng loạt.
 */
const drawLabel = (doc: PDFKit.PDFDocument, shipment: LabelShipment) => {
  const { order, provider, providerOrderCode } = shipment;

  doc.fontSize(14).text(provider.name, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).text(`Mã vận đơn: ${providerOrderCode ?? "—"}`, { align: "center" });
  doc.text(`Mã đơn hàng: ${order.orderCode}`, { align: "center" });
  doc.moveDown(0.8);

  doc.fontSize(11).text("Người nhận:", { continued: false });
  doc.fontSize(12).text(order.shippingContactName);
  doc.fontSize(11).text(order.shippingPhone);
  doc.text(`${order.shippingDetail}, ${order.shippingWard}, ${order.shippingProvince}`);
  doc.moveDown(0.6);

  const codLabel = order.paymentStatus === "UNPAID" ? `Thu hộ (COD): ${Number(order.totalAmount).toLocaleString("vi-VN")}đ` : "Đã thanh toán — không thu hộ";
  doc.fontSize(12).text(codLabel, { underline: true });
  doc.moveDown(0.6);

  doc.fontSize(10).text("Sản phẩm:");
  order.orderItems.forEach((item) => {
    doc.text(`- ${item.productVariant.product.name} (${item.productVariant.code ?? "N/A"}) x${item.quantity}`);
  });
};

export const generateBulkShipmentLabelsPdf = async (shipments: LabelShipment[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A6", margin: 20 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    shipments.forEach((shipment, index) => {
      if (index > 0) doc.addPage({ size: "A6", margin: 20 });
      drawLabel(doc, shipment);
    });

    doc.end();
  });
};
