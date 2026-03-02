import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { PaymentTransactionStatus, Prisma } from "@prisma/client";
// import { findPaymentMethodById, createPaymentTransaction, findTransactionByOrderId } from "./payment.repository";
import { SePayWebhookPayload, sePayWebhookSchema, webhookPayloadSchema } from "./payment.validation";
import { momoIpnSchema, vnpayIpnSchema, MomoIpnPayload, VnpayIpnPayload } from "./payment.validation";
import { IncomingHttpHeaders } from "http";
import crypto from "crypto";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { VNPay, HashAlgorithm } from "vnpay";
import { Request, Response } from "express";

export const getActivePaymentMethods = async () => {
  return prisma.payment_methods.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
};

// const SEPAY_API_KEY = process.env.SEPAY_API_KEY;

const verifySePay = (headers: IncomingHttpHeaders, payload: SePayWebhookPayload) => {
  const authHeader = headers.authorization;

  const apiKey = authHeader?.replace("Apikey ", "");

  // console.log("Header API key:", apiKey);

  if (process.env.SEPAY_API_KEY && apiKey !== process.env.SEPAY_API_KEY) {
    throw new BadRequestError("API key không hợp lệ");
  }

  if (payload.transferType !== "in") {
    throw new BadRequestError("Bỏ qua giao dịch chuyển ra");
  }
};

// Tìm order từ nội dung chuyển khoản
// Convention: nội dung CK phải chứa bankTransferCode của order
// VD: "Thanh toan DH-ABC123" → tìm order có bankTransferCode = "DH-ABC123"
const findOrderByTransferContent = async (content: string) => {
  // Lấy tất cả orders đang chờ thanh toán có bankTransferCode
  // Rồi check xem content có chứa code không

  const pendingOrders = await prisma.orders.findMany({
    where: {
      paymentStatus: "UNPAID",
      bankTransferCode: { not: null },
    },
    select: {
      id: true,
      paymentStatus: true,
      totalAmount: true,
      paymentMethodId: true,
      bankTransferCode: true,
    },
  });

  const contentUpper = content.toUpperCase();
  return pendingOrders.find((o) => o.bankTransferCode && contentUpper.includes(o.bankTransferCode.toUpperCase())) ?? null;
};

export const handleSePayWebhook = async (rawPayload: unknown, headers: IncomingHttpHeaders) => {
  const payload = sePayWebhookSchema.parse(rawPayload);

  verifySePay(headers, payload);
  /**
   * Idempotency check
   * (SePay có thể gửi webhook nhiều lần)
   */
  const existed = await prisma.payment_transactions.findFirst({
    where: {
      transactionRef: payload.referenceCode,
    },
  });

  if (existed) {
    console.log("[SePay Webhook] Duplicate webhook ignored:", payload.referenceCode);
    return { success: true, message: "Already processed" };
  }

  /**
   * Find order bằng nội dung chuyển khoản
   */
  const order = await findOrderByTransferContent(payload.content);

  if (!order) {
    console.warn("[SePay Webhook] Không tìm thấy order cho content:", payload.content);

    // Không throw để tránh SePay retry spam
    return {
      success: true,
      message: "Không khớp đơn hàng nào",
    };
  }

  if (!order.paymentMethodId) {
    throw new BadRequestError("Order chưa có payment method");
  }

  /**
   * Evaluate payment amount
   */
  const expectedAmount = Number(order.totalAmount);
  const receivedAmount = Number(payload.transferAmount);

  let transactionStatus: PaymentTransactionStatus;

  if (receivedAmount === expectedAmount) {
    transactionStatus = "COMPLETED";
  } else if (receivedAmount < expectedAmount) {
    transactionStatus = "UNDERPAID";
  } else {
    transactionStatus = "OVERPAID";
  }

  /**
   * CREATE NEW TRANSACTION (1 → N)
   *  KHÔNG update transaction cũ
   */
  const transaction = await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId,
      amount: receivedAmount,
      transactionRef: payload.referenceCode,
      status: transactionStatus,
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  /**
   * Tính tổng tiền đã thanh toán
   * (support nhiều lần chuyển tiền)
   */
  const paidAggregation = await prisma.payment_transactions.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      orderId: order.id,
      status: "COMPLETED",
    },
  });

  const totalPaid = Number(paidAggregation._sum.amount ?? 0);

  /**
   * Update order nếu đã đủ tiền
   */
  let newPaymentStatus = order.paymentStatus;

  if (totalPaid >= expectedAmount && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
      },
    });

    newPaymentStatus = "PAID";

    console.log(`[SePay Webhook] Order ${order.id} đã thanh toán đủ. TotalPaid=${totalPaid}`);
  } else {
    console.log(`[SePay Webhook] Order ${order.id} chưa đủ tiền. Paid=${totalPaid}/${expectedAmount}`);
  }

  /**
   * Done
   */
  return {
    success: true,
    orderId: order.id,
    transactionId: transaction.id,
    transactionStatus,
    totalPaid,
    expectedAmount,
    newPaymentStatus,
  };
};

// MoMo production
// export const createMomoPaymentUrl = async (orderId: string, amount: number, orderInfo: string) => {
//   const partnerCode = process.env.MOMO_PARTNER_CODE!;
//   const accessKey = process.env.MOMO_ACCESS_KEY!;
//   const secretKey = process.env.MOMO_SECRET_KEY!;
//   const redirectUrl = process.env.MOMO_REDIRECT_URL!;
//   const ipnUrl = process.env.MOMO_IPN_URL!;

//   const requestId = uuidv4();
//   const momoOrderId = `MOMO-${orderId}-${Date.now()}`; // unique per request
//   const requestType = "payWithMethod";
//   const extraData = "";
//   const autoCapture = true;
//   const lang = "vi";

//   const rawSignature =
//     `accessKey=${accessKey}` +
//     `&amount=${amount}` +
//     `&extraData=${extraData}` +
//     `&ipnUrl=${ipnUrl}` +
//     `&orderId=${momoOrderId}` +
//     `&orderInfo=${orderInfo}` +
//     `&partnerCode=${partnerCode}` +
//     `&redirectUrl=${redirectUrl}` +
//     `&requestId=${requestId}` +
//     `&requestType=${requestType}`;

//   const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

//   const body = {
//     partnerCode,
//     accessKey,
//     requestId,
//     amount,
//     orderId: momoOrderId,
//     orderInfo,
//     redirectUrl,
//     ipnUrl,
//     extraData,
//     requestType,
//     signature,
//     lang,
//     autoCapture,
//   };

//   const response = await axios.post(process.env.MOMO_API_URL!, body, {
//     headers: { "Content-Type": "application/json" },
//   });

//   if (response.data.resultCode !== 0) {
//     throw new BadRequestError(`MoMo error: ${response.data.message}`);
//   }

//   // Lưu momoOrderId vào order để sau IPN tìm lại
//   await prisma.orders.update({
//     where: { id: orderId },
//     data: { momoOrderId },
//   });

//   return {
//     paymentUrl: response.data.payUrl, // Redirect FE sang đây
//     momoOrderId,
//     deeplink: response.data.deeplink, // Mở app MoMo trực tiếp
//     qrCodeUrl: response.data.qrCodeUrl,
//   };
// };

// Momo sandbox
export const createMomoPaymentUrl = async (orderId: string, amount: number, orderInfo: string) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE!;
  const accessKey = process.env.MOMO_ACCESS_KEY!;
  const secretKey = process.env.MOMO_SECRET_KEY!;
  const redirectUrl = process.env.MOMO_REDIRECT_URL!;
  const ipnUrl = process.env.MOMO_IPN_URL!;
  const requestType = "payWithMethod";
  const extraData = "";
  const autoCapture = true;
  const lang = "vi";

  // Đúng theo format MoMo sandbox
  const momoOrderId = `${partnerCode}${Date.now()}`;
  const requestId = momoOrderId;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${momoOrderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId,
    amount: String(amount), // MoMo sandbox cần string
    orderId: momoOrderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId: "",
    signature,
  });

  const response = await axios.post(process.env.MOMO_API_URL!, requestBody, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  });

  if (response.data.resultCode !== 0) {
    throw new BadRequestError(`MoMo error: ${response.data.message}`);
  }

  // Lưu momoOrderId vào order
  await prisma.orders.update({
    where: { id: orderId },
    data: { momoOrderId },
  });

  return {
    paymentUrl: response.data.payUrl,
    momoOrderId,
    shortLink: response.data.shortLink,
  };
};

const redirectToFrontend = (res: Response, orderId: string) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return res.redirect(`${frontendUrl}/payment/result?orderId=${orderId}`);
};

export const momoReturnHandler = async (req: Request, res: Response) => {
  const { orderId } = req.query as any;

  return redirectToFrontend(res, orderId);
};

export const handleMomoIpn = async (rawPayload: unknown) => {
  const payload = momoIpnSchema.parse(rawPayload);

  // 1. Verify signature
  const secretKey = process.env.MOMO_SECRET_KEY!;
  const accessKey = process.env.MOMO_ACCESS_KEY!;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${payload.amount}` +
    `&extraData=${payload.extraData ?? ""}` +
    `&message=${payload.message}` +
    `&orderId=${payload.orderId}` +
    `&orderInfo=${payload.orderInfo}` +
    `&orderType=${payload.orderType}` +
    `&partnerCode=${payload.partnerCode}` +
    `&payType=${payload.payType ?? ""}` +
    `&requestId=${payload.requestId}` +
    `&responseTime=${payload.responseTime}` +
    `&resultCode=${payload.resultCode}` +
    `&transId=${payload.transId}`;

  const expectedSig = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  if (payload.signature !== expectedSig) {
    throw new BadRequestError("Chữ ký MoMo không hợp lệ");
  }

  // 2. Idempotency - tránh xử lý 2 lần
  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: String(payload.transId) },
  });
  if (existed) return { success: true, message: "Already processed" };

  // 3. Tìm order theo momoOrderId
  const order = await prisma.orders.findFirst({
    where: { momoOrderId: payload.orderId },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });

  if (!order) {
    console.warn("[MoMo IPN] Không tìm thấy order:", payload.orderId);
    return { success: true, message: "Order not found" };
  }

  // 4. Xác định trạng thái
  const isSuccess = payload.resultCode === 0;
  const transactionStatus = isSuccess ? "COMPLETED" : "FAILED";
  const newPaymentStatus = isSuccess ? "PAID" : "UNPAID";

  // 5. Tạo transaction
  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: payload.amount,
      transactionRef: String(payload.transId),
      status: transactionStatus,
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  // 6. Update order
  if (isSuccess && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
  }

  console.log(`[MoMo IPN] Order ${order.id} → ${newPaymentStatus}`);
  return { success: true, orderId: order.id, transactionStatus, newPaymentStatus };
};

// VNPAY

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE!,
  secureSecret: process.env.VNPAY_HASH_SECRET!,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
});

export const createVnpayPaymentUrl = async (orderId: string, amount: number, orderInfo: string, ipAddr: string) => {
  const txnRef = `${Date.now()}${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
  });

  await prisma.orders.update({
    where: { id: orderId },
    data: { vnpayTxnRef: txnRef },
  });

  return { paymentUrl, txnRef };
};

export const handleVnpayIpn = async (rawQuery: unknown) => {
  const verify = vnpay.verifyReturnUrl(rawQuery as any);

  console.log("[VNPay IPN] verify:", JSON.stringify(verify));

  if (!verify.isVerified) {
    console.log("[VNPay IPN] Signature invalid");
    return { RspCode: "97", Message: "Invalid signature" };
  }

  const payload = rawQuery as any;

  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: payload.vnp_TransactionNo },
  });
  // console.log("[VNPay IPN] existed:", existed);
  if (existed) return { RspCode: "00", Message: "Already processed" };

  const order = await prisma.orders.findFirst({
    where: { vnpayTxnRef: payload.vnp_TxnRef },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });
  // console.log("[VNPay IPN] order found:", order);

  if (!order) return { RspCode: "01", Message: "Order not found" };

  const receivedAmount = Number(payload.vnp_Amount) / 100;
  const expectedAmount = Number(order.totalAmount);
  // console.log("[VNPay IPN] amount check:", { receivedAmount, expectedAmount });

  if (receivedAmount !== expectedAmount) {
    return { RspCode: "04", Message: "Invalid amount" };
  }

  const isSuccess = verify.isSuccess;
  const transactionStatus = isSuccess ? "COMPLETED" : "FAILED";

  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: receivedAmount,
      transactionRef: payload.vnp_TransactionNo,
      status: transactionStatus,
      payload: rawQuery as Prisma.InputJsonValue,
    },
  });

  if (isSuccess && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
  }

  return { RspCode: "00", Message: "Confirm Success" };
};

// Chỉ hiển thị kết quả, KHÔNG xử lý logic
export const vnpayReturnHandler = async (req: Request, res: Response) => {
  const orderId = req.query.vnp_TxnRef as string;

  // verify chỉ để log/debug (không quyết định UI)
  vnpay.verifyReturnUrl(req.query as any);

  return redirectToFrontend(res, orderId);
};

export const createZaloPayPaymentUrl = async (orderId: string, amount: number, description: string) => {
  const appId = Number(process.env.ZALOPAY_APP_ID!);
  const key1 = process.env.ZALOPAY_KEY1!;

  const transID = `${Date.now()}`;
  const appTransId = `${new Date().toISOString().slice(2, 10).replace(/-/g, "")}_${transID}`;
  const appTime = Date.now();
  const appUser = "user123";
  const embedData = JSON.stringify({ redirecturl: process.env.ZALOPAY_REDIRECT_URL });
  const items = JSON.stringify([{}]);

  // Sign: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
  const rawSignature = `${appId}|${appTransId}|${appUser}|${amount}|${appTime}|${embedData}|${items}`;
  const mac = crypto.createHmac("sha256", key1).update(rawSignature).digest("hex");

  const body = {
    app_id: appId,
    app_trans_id: appTransId,
    app_user: appUser,
    app_time: appTime,
    item: items,
    embed_data: embedData,
    amount,
    description,
    bank_code: "",
    callback_url: process.env.ZALOPAY_CALLBACK_URL!,
    mac,
  };

  const response = await axios.post(process.env.ZALOPAY_API_URL!, body, {
    headers: { "Content-Type": "application/json" },
  });

  if (response.data.return_code !== 1) {
    throw new BadRequestError(`ZaloPay error: ${response.data.return_message}`);
  }

  // Lưu appTransId vào order
  await prisma.orders.update({
    where: { id: orderId },
    data: { zaloPayTransId: appTransId },
  });

  return {
    paymentUrl: response.data.order_url,
    appTransId,
    zaloPayOrderToken: response.data.zp_trans_token,
  };
};

export const handleZaloPayCallback = async (rawPayload: unknown) => {
  const key2 = process.env.ZALOPAY_KEY2!;
  const payload = rawPayload as any;

  // 1. Verify MAC
  const mac = crypto.createHmac("sha256", key2).update(payload.data).digest("hex");
  if (mac !== payload.mac) {
    return { return_code: -1, return_message: "MAC không hợp lệ" };
  }

  const data = JSON.parse(payload.data);

  // 2. Idempotency
  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: String(data.zp_trans_id) },
  });
  if (existed) return { return_code: 1, return_message: "Already processed" };

  // 3. Tìm order
  const order = await prisma.orders.findFirst({
    where: { zaloPayTransId: data.app_trans_id },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });

  if (!order) {
    console.warn("[ZaloPay CB] Không tìm thấy order:", data.app_trans_id);
    return { return_code: 1, return_message: "Order not found" };
  }

  // 4. Tạo transaction
  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: data.amount,
      transactionRef: String(data.zp_trans_id),
      status: "COMPLETED",
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  // 5. Update order PAID
  await prisma.orders.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID" },
  });

  console.log(`[ZaloPay CB] Order ${order.id} → PAID`);
  return { return_code: 1, return_message: "Thành công" };
};

export const zaloPayReturnHandler = async (req: Request, res: Response) => {
  const { apptransid } = req.query as any; // hoặc orderId bạn map

  return redirectToFrontend(res, apptransid);
};

// Webhook handler logic (fake verify)
// export const handlePaymentWebhook = async (rawPayload: any) => {
//   // 1. Validate payload cơ bản
//   const payload = webhookPayloadSchema.parse(rawPayload);

//   const { orderId, status } = payload;

//   // 2. Kiểm tra order tồn tại
//   const order = await prisma.orders.findUnique({
//     where: { id: orderId },
//     select: { id: true, paymentStatus: true, totalAmount: true, paymentMethodId: true },
//   });

//   if (!order) throw new NotFoundError("Đơn hàng");

//   // 3. Tạo/lấy transaction
//   let transaction = await findTransactionByOrderId(orderId);

//   if (!transaction) {
//     if (!order.paymentMethodId) {
//       throw new BadRequestError("Đơn hàng chưa có phương thức thanh toán");
//     }

//     const paymentMethod = await findPaymentMethodById(order.paymentMethodId);
//     if (!paymentMethod) throw new NotFoundError("Phương thức thanh toán");

//     transaction = await createPaymentTransaction({
//       orderId,
//       paymentMethodId: order.paymentMethodId,
//       amount: order.totalAmount,
//       transactionRef: payload.transactionRef,
//       status: "PENDING",
//       payload: rawPayload as Prisma.InputJsonValue,
//     });
//   }

//   if (!transaction) {
//     throw new Error("Không thể tạo giao dịch thanh toán");
//   }

//   // 4. Cập nhật transaction status
//   await prisma.payment_transactions.update({
//     where: { id: transaction.id },
//     data: {
//       status: status === "COMPLETED" ? "COMPLETED" : status === "REFUNDED" ? "REFUNDED" : "FAILED",
//       payload: rawPayload as Prisma.InputJsonValue,
//     },
//   });

//   // 5. Cập nhật order paymentStatus
//   const newPaymentStatus = status === "COMPLETED" ? "PAID" : status === "REFUNDED" ? "REFUNDED" : "UNPAID";

//   await prisma.orders.update({
//     where: { id: orderId },
//     data: { paymentStatus: newPaymentStatus },
//   });

//   return { success: true, orderId, newPaymentStatus };
// };
