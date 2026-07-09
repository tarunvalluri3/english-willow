import { Router } from "express";
import { Webhook } from "svix";

import clerkWebhookController from "./clerkWebhook.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Clerk Webhook
|--------------------------------------------------------------------------
*/

router.post(
  "/clerk",
  async (req, res, next) => {
    try {
      const svixId = req.headers["svix-id"];
      const svixTimestamp = req.headers["svix-timestamp"];
      const svixSignature = req.headers["svix-signature"];

      if (
        !svixId ||
        !svixTimestamp ||
        !svixSignature
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Missing Svix headers.",
          });
      }

      const payload = JSON.stringify(req.body);

      const wh = new Webhook(
        process.env.CLERK_WEBHOOK_SECRET,
      );

      wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });

      next();
    } catch (error) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid webhook signature.",
        });
    }
  },
  clerkWebhookController.handleWebhook,
);

export default router;