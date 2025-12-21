import { Router } from "express";

import userRoutes from "@/modules/user/user.route";
import authRoutes from "@/modules/auth/auth.route";
import categoryRoutes from "@/modules/category/category.route";
import productRoutes from "@/modules/product/product.route";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;
