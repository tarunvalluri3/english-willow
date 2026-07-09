import { Router } from "express";
import categoryRoutes from "../modules/category/category.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import wishlistRoutes from "../modules/wishlist/wishlist.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import reviewRoutes from "../modules/review/review.routes.js";

const router = Router();

/*
Feature Routes
*/

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes); 
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

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
