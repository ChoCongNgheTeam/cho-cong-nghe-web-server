import { Request } from "express";
import { createMomoPaymentUrl } from "../payment/providers/momo/momo.service";
import { createVnpayPaymentUrl, getClientIp } from "../payment/providers/vnpay/vnpay.service";
import { createZaloPayPaymentUrl } from "../payment/providers/zalopay/zalopay.service";
import { createStripePaymentIntent } from "../payment/providers/stripe/stripe.service";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Các field thanh toán sẽ được ghi thẳng vào bảng orders khi tạo order.
 * Đây là subset của CheckoutSummary — chỉ các field liên quan đến payment.
 */
export interface PaymentFields {
  bankTransferQrUrl?: string;
  bankTransferContent?: string;
  bankTransferExpiredAt?: Date;
  paymentExpiredAt?: Date;
  paymentRedirectUrl?: string;
}

/**
 * Kết quả trả về cho FE để hiển thị ngay sau checkout.
 * Không lưu vào DB — chỉ truyền qua response.
 */
export interface PaymentInfo {
  type: string;
  [key: string]: any;
}

export interface BuildPaymentInfoResult {
  /** Fields ghi thẳng vào DB khi tạo order (atomic) */
  paymentFields: PaymentFields;
  /** Data trả về FE để hiển thị (QR, redirect URL, Stripe client secret...) */
  paymentInfo: PaymentInfo | null;
}

// ─── TTL Constants ────────────────────────────────────────────────────────────

const REDIRECT_TTL_MS = 15 * 60 * 1000; // 15 phút — Momo/VNPay/ZaloPay/Stripe
const BANK_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ — Bank Transfer

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Build payment info TRƯỚC KHI tạo order.
 *
 * Mục đích: Thực hiện toàn bộ HTTP calls ra external providers (VietQR, Momo, VNPay...)
 * và trả về { paymentFields, paymentInfo }:
 *
 * - paymentFields → được merge vào CheckoutSummary → ghi vào DB trong Prisma transaction
 *                   (atomic, không cần updateOrderPaymentInfo sau)
 * - paymentInfo   → trả thẳng về FE qua response body
 *
 * ⚠️  Hàm này KHÔNG được gọi bên trong Prisma transaction vì có HTTP calls.
 *     Gọi TRƯỚC transaction, truyền kết quả vào executeOrderTransaction.
 *
 * @param req        Express request (để lấy client IP cho VNPay)
 * @param orderRef   Unique reference dùng làm orderCode / bankTransferCode
 * @param methodCode payment_methods.code (đã uppercase)
 * @param totalAmount Tổng tiền đơn hàng
 * @param bankTransferCode Mã chuyển khoản (chỉ dùng cho BANK_TRANSFER)
 */
export const buildPaymentInfo = async (req: Request, orderRef: string, methodCode: string, totalAmount: number, bankTransferCode?: string): Promise<BuildPaymentInfoResult> => {
  const upper = methodCode.toUpperCase();
  const orderInfo = `Thanh toan don hang ${orderRef}`;

  // ── Bank Transfer ──────────────────────────────────────────────────────────
  if (upper.includes("BANK_TRANSFER") && bankTransferCode) {
    const qrUrl = [`https://img.vietqr.io/image`, `/${process.env.BANK_BIN}-${process.env.BANK_ACCOUNT}-compact2.png`, `?amount=${totalAmount}&addInfo=${bankTransferCode}`].join("");

    const expiredAt = new Date(Date.now() + BANK_TTL_MS);

    return {
      paymentFields: {
        bankTransferQrUrl: qrUrl,
        bankTransferContent: bankTransferCode,
        bankTransferExpiredAt: expiredAt,
      },
      paymentInfo: {
        type: "BANK_TRANSFER",
        bankName: process.env.BANK_NAME,
        accountNumber: process.env.BANK_ACCOUNT,
        accountName: process.env.BANK_HOLDER,
        amount: totalAmount,
        content: bankTransferCode,
        qrCode: qrUrl,
        expiredAt: expiredAt.toISOString(),
      },
    };
  }

  // ── MoMo ──────────────────────────────────────────────────────────────────
  if (upper.includes("MOMO")) {
    const momo = await createMomoPaymentUrl(orderRef, totalAmount, orderInfo);
    return {
      paymentFields: {
        paymentRedirectUrl: momo.paymentUrl,
        paymentExpiredAt: new Date(Date.now() + REDIRECT_TTL_MS),
      },
      paymentInfo: { type: "MOMO", ...momo },
    };
  }

  // ── VNPay ─────────────────────────────────────────────────────────────────
  if (upper.includes("VNPAY")) {
    const vnpay = await createVnpayPaymentUrl(orderRef, totalAmount, orderInfo, getClientIp(req));
    return {
      paymentFields: {
        paymentRedirectUrl: vnpay.paymentUrl,
        paymentExpiredAt: new Date(Date.now() + REDIRECT_TTL_MS),
      },
      paymentInfo: { type: "VNPAY", ...vnpay },
    };
  }

  // ── ZaloPay ───────────────────────────────────────────────────────────────
  if (upper.includes("ZALOPAY")) {
    const zalopay = await createZaloPayPaymentUrl(orderRef, totalAmount, orderInfo);
    return {
      paymentFields: {
        paymentRedirectUrl: zalopay.paymentUrl,
        paymentExpiredAt: new Date(Date.now() + REDIRECT_TTL_MS),
      },
      paymentInfo: { type: "ZALOPAY", ...zalopay },
    };
  }

  // ── Stripe / Credit Card ──────────────────────────────────────────────────
  if (upper.includes("STRIPE") || upper.includes("CREDIT_CARD")) {
    const stripe = await createStripePaymentIntent(orderRef, totalAmount);
    return {
      paymentFields: {
        paymentExpiredAt: new Date(Date.now() + REDIRECT_TTL_MS),
      },
      paymentInfo: { type: "STRIPE", ...stripe },
    };
  }

  // ── COD hoặc không xác định ───────────────────────────────────────────────
  return {
    paymentFields: {},
    paymentInfo: null,
  };
};
