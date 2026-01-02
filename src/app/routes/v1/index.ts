import { Router } from "express";

import userRoutes from "@/app/modules/user/user.route";
import authRoutes from "@/app/modules/auth/auth.route";
import categoryRoutes from "@/app/modules/category/category.route";
import productRoutes from "@/app/modules/product/product.route";
import orderRoutes from "@/app/modules/order/order.route";
import reviewRoutes from "@/app/modules/review/review.route";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);

export default router;
