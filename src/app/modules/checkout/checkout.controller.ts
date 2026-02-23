import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";

/**
 * GET /checkout/validate
 * Validate current cart before checkout
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
 * POST /checkout
 * Process checkout and create order
 */
export const checkoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const input = req.body;

  // Prepare checkout data with all validations
  const checkoutSummary = await prepareCheckoutData(userId, input);

  // Create order
  const order = await createOrderFromCheckout(userId, checkoutSummary);

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      orderDate: order.orderDate,
      summary: {
        items: checkoutSummary.items,
        subtotalAmount: checkoutSummary.subtotalAmount,
        shippingFee: checkoutSummary.shippingFee,
        voucherDiscount: checkoutSummary.voucherDiscount,
        taxAmount: checkoutSummary.taxAmount,
        totalAmount: checkoutSummary.totalAmount,
      },
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    },
    message: "Order created successfully",
  });
};

/**
 * GET /checkout/preview
 * Preview checkout summary without creating order
 */
export const checkoutPreviewHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentMethodId, shippingAddressId, voucherId } = req.query;

  const input = {
    paymentMethodId: paymentMethodId as string,
    shippingAddressId: shippingAddressId as string,
    voucherId: voucherId as string | undefined,
  };

  const checkoutSummary = await prepareCheckoutData(userId, input);

  res.json({
    success: true,
    data: checkoutSummary,
    message: "Checkout preview retrieved successfully",
  });
};
