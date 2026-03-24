import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";
import { buildPaymentInfo } from "./payment-info.builder";


// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * GET /checkout/validate
 * Validate giỏ hàng hiện tại trước khi checkout
 */
export const validateCheckoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const validation = await validateCartItems(userId);

  res.json({
    success: true,
    data: {
      isValid: validation.isValid,
      totalItems: validation.totalItems,
      totalQuantity: validation.totalQuantity,
      items: validation.items,
      errors: validation.errors,
    },
    message: validation.isValid ? "Cart is valid" : "Cart has errors, please check",
  });
};

/**
 * GET /checkout/preview
 * Preview tổng đơn hàng mà không tạo order
 */
export const checkoutPreviewHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentMethodId, shippingAddressId, voucherId } = req.query;

  const input = {
    paymentMethodId: paymentMethodId as string,
    shippingAddressId: shippingAddressId as string,
    voucherId: voucherId && voucherId !== "" ? (voucherId as string) : undefined,
  };

  const checkoutSummary = await prepareCheckoutData(userId, input);

  res.json({
    success: true,
    data: checkoutSummary,
    message: "Checkout preview retrieved successfully",
  });
};

/**
 * POST /checkout
 * Tạo đơn hàng từ giỏ hàng
 *
 * Flow (đúng thứ tự, atomic):
 *  1. prepareCheckoutData    — validate cart, tính tiền, tạo bankTransferCode
 *  2. buildPaymentInfo       — HTTP calls ra external providers (VietQR/Momo/VNPay...)
 *                              Chạy NGOÀI transaction vì Prisma không cho HTTP bên trong
 *  3. Merge paymentFields    — gộp kết quả vào summary
 *  4. createOrderFromCheckout — 1 Prisma transaction: tạo order (ĐÃ có QR/URL), trừ kho, xóa cart
 *                               Không cần updateOrderPaymentFields sau — hoàn toàn atomic
 */
export const checkoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Bước 1: Chuẩn bị dữ liệu (validate, tính tiền)
  const checkoutSummary = await prepareCheckoutData(userId, req.body);

  // Generate orderCode sớm — dùng làm orderRef cho payment providers
  // để orderId trong Momo/VNPay/ZaloPay khớp với orderCode thực trong DB
  const numberPart = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  const letterPart = Math.random().toString(36).substring(2, 4).toUpperCase();

  const uuidPart = crypto.randomUUID().slice(0, 6).toUpperCase();

  const orderCode = `CCN${numberPart}${letterPart}${uuidPart}`;

  // Bước 2: Build payment info — HTTP calls ra ngoài, TRƯỚC transaction
  // orderRef = orderCode thực (không phải REF-timestamp nữa)
  const { paymentFields, paymentInfo } = await buildPaymentInfo(
    req,
    checkoutSummary.bankTransferCode ?? orderCode,
    checkoutSummary.paymentMethodCode,
    checkoutSummary.totalAmount,
    checkoutSummary.bankTransferCode,
  );

  // Bước 3: Merge paymentFields + orderCode đã generate vào summary
  const summaryWithPayment = { ...checkoutSummary, paymentFields, orderCode };

  // Bước 4: 1 transaction duy nhất — order được tạo đã có đủ QR/URL ngay từ đầu
  const order = await createOrderFromCheckout(userId, summaryWithPayment);

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethodCode: checkoutSummary.paymentMethodCode.toUpperCase(),
      summary: {
        subtotalAmount: checkoutSummary.subtotalAmount,
        shippingFee: checkoutSummary.shippingFee,
        voucherDiscount: checkoutSummary.voucherDiscount,
        taxAmount: checkoutSummary.taxAmount,
        totalAmount: checkoutSummary.totalAmount,
        itemCount: checkoutSummary.items.length,
      },
      paymentInfo,
    },
    message: "Order created successfully",
  });
};
