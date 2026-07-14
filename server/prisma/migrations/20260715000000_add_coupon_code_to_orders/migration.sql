-- Preserve the coupon code used for each order, alongside its applied discount.
ALTER TABLE "orders"
ADD COLUMN "coupon_code" VARCHAR(50);

CREATE INDEX "orders_coupon_code_idx" ON "orders"("coupon_code");

