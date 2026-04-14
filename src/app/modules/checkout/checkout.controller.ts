import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";
import { buildPaymentInfo } from "./payment-info.builder";

/**
 * GET /checkout/validate
 */
export const validateCheckoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const cartItemIds = req.query.cartItemIds as string[] | undefined; 
  
  const validation = await validateCartItems(userId, cartItemIds);

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
 */
export const checkoutPreviewHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentMethodId, shippingAddressId, voucherId, cartItemIds } = req.query;

  const input = {
    paymentMethodId: paymentMethodId as string,
    shippingAddressId: shippingAddressId as string,
    voucherId: voucherId && voucherId !== "" ? (voucherId as string) : undefined,
    cartItemIds: cartItemIds as string[] | undefined,
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
 */
export const checkoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const checkoutSummary = await prepareCheckoutData(userId, req.body);

  const numberPart = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  const letterPart = Math.random().toString(36).substring(2, 4).toUpperCase();
  const uuidPart = crypto.randomUUID().slice(0, 6).toUpperCase();
  const orderCode = `CCN${numberPart}${letterPart}${uuidPart}`;

  const { paymentFields, paymentInfo } = await buildPaymentInfo(
    req,
    checkoutSummary.bankTransferCode ?? orderCode,
    checkoutSummary.paymentMethodCode,
    checkoutSummary.totalAmount,
    checkoutSummary.bankTransferCode,
  );

  const summaryWithPayment = { ...checkoutSummary, paymentFields, orderCode };

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
        totalAmount: checkoutSummary.totalAmount,
        itemCount: checkoutSummary.items.length,
      },
      paymentInfo,
    },
    message: "Order created successfully",
  });
};