import { Router } from "express";
import categoryRoutes from "../modules/category/category.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.routes.js";

const router = Router();

/*
Feature Routes
*/

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
// router.use("/orders", orderRoutes);
// router.use("/cart", cartRoutes);

/*
Health Check
*/

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
  });
});

export default router;
