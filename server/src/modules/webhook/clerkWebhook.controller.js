import asyncHandler from "../../common/asyncHandler.js";

import clerkWebhookService from "./clerkWebhook.service.js";

class ClerkWebhookController {
  handleWebhook = asyncHandler(async (req, res) => {
    const { type, data } = req.body;

    switch (type) {
      case "user.created":
        await clerkWebhookService.handleUserCreated(data);
        break;

      case "user.updated":
        await clerkWebhookService.handleUserUpdated(data);
        break;

      case "user.deleted":
        await clerkWebhookService.handleUserDeleted(data);
        break;

      default:
        break;
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully.",
    });
  });
}

export default new ClerkWebhookController();