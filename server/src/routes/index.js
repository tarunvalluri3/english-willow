import { Router } from "express";
import categoryRoutes from "../modules/category/category.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import wishlistRoutes from "../modules/wishlist/wishlist.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import reviewRoutes from "../modules/review/review.routes.js";
import addressRoutes from "../modules/address/address.routes.js";
import couponRoutes from "../modules/coupon/coupon.routes.js"; 
import uploadRoutes from "../modules/upload/upload.routes.js";
import notificationRoutes from "../modules/notification/notification.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import authRoutes from "../modules/auth/auth.routes.js"; 
import clerkWebhookRoutes from "../modules/webhook/clerkWebhook.routes.js"; 
import userRoutes from "../modules/user/user.routes.js";



const router = Router();

/*
Feature Routes
*/

router.use("/webhooks", clerkWebhookRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes); 
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/addresses", addressRoutes); 
router.use("/coupons", couponRoutes); 
router.use("/uploads", uploadRoutes);
router.use("/notifications", notificationRoutes); 
router.use("/dashboard", dashboardRoutes); 
router.use("/users", userRoutes);

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
