import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import notificationService from "./notification.service.js";

class NotificationController {
  sendWelcomeEmail = asyncHandler(async (req, res) => {
    const result = await notificationService.sendWelcomeEmail(
      req.body.user,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Welcome email sent successfully.",
        result,
      ),
    );
  });

  sendOrderPlacedEmail = asyncHandler(async (req, res) => {
    const result =
      await notificationService.sendOrderPlacedEmail(
        req.body.order,
        req.body.user,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order placed email sent successfully.",
        result,
      ),
    );
  });

  sendOrderStatusEmail = asyncHandler(async (req, res) => {
    const result =
      await notificationService.sendOrderStatusEmail(
        req.body.order,
        req.body.user,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order status email sent successfully.",
        result,
      ),
    );
  });

  sendCustomEmail = asyncHandler(async (req, res) => {
    const result =
      await notificationService.sendCustomEmail(
        req.body,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Email sent successfully.",
        result,
      ),
    );
  });
}

export default new NotificationController();