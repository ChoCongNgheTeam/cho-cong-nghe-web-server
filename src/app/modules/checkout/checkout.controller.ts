import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";
import { BadRequestError, NotFoundError } from "@/errors";

/**
 * GET /checkout/validate
 * Validate current cart before checkout
 * 🔥 FIXED: Added try-catch error handling
 */
export const validateCheckoutHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const validation = await validateCartItems(userId);

    return res.json({
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
  } catch (error) {
    console.error("Validate checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate cart",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /checkout
 * Process checkout and create order
 * 🔥 FIXED: Added comprehensive error handling
 * 🔥 UPDATED: Added taxAmount to response
 */
export const checkoutHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const input = req.body;

    // Prepare checkout data with all validations
    const checkoutSummary = await prepareCheckoutData(userId, input);

    // Create order
    const order = await createOrderFromCheckout(userId, checkoutSummary);

    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderDate: order.orderDate,
        summary: {
          items: checkoutSummary.items,
          subtotalAmount: checkoutSummary.subtotalAmount,
          shippingFee: checkoutSummary.shippingFee,
          voucherDiscount: checkoutSummary.voucherDiscount,
          taxAmount: checkoutSummary.taxAmount, // 🔥 NEW
          totalAmount: checkoutSummary.totalAmount,
        },
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Checkout error:", error);

    // Handle specific error types
    if (error instanceof BadRequestError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /checkout/preview
 * Preview checkout summary without creating order
 * 🔥 FIXED: Added try-catch error handling
 * 🔥 UPDATED: Response now includes taxAmount
 */
export const checkoutPreviewHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { paymentMethodId, shippingAddressId, voucherId } = req.query;

    if (!paymentMethodId || !shippingAddressId) {
      return res.status(400).json({
        success: false,
        message: "Please provide paymentMethodId and shippingAddressId",
      });
    }

    const input = {
      paymentMethodId: paymentMethodId as string,
      shippingAddressId: shippingAddressId as string,
      voucherId: voucherId as string | undefined,
    };

    const checkoutSummary = await prepareCheckoutData(userId, input);

    return res.json({
      success: true,
      data: checkoutSummary,
      message: "Checkout preview retrieved successfully",
    });
  } catch (error) {
    console.error("Checkout preview error:", error);

    // Handle specific error types
    if (error instanceof BadRequestError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: "Failed to get checkout preview",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
