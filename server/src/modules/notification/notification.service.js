import ApiError from "../../common/ApiError.js";

import emailService from "../../services/email.service.js";

class NotificationService {
  async sendWelcomeEmail(user) {
    if (!user?.email) {
      throw new ApiError(
        400,
        "User email is required."
      );
    }

    return emailService.sendWelcomeEmail(user);
  }

  async sendOrderPlacedEmail(order, user) {
    if (!user?.email) {
      throw new ApiError(
        400,
        "User email is required."
      );
    }

    return emailService.sendOrderPlacedEmail(
      order,
      user,
    );
  }

  async sendOrderStatusEmail(order, user) {
    if (!user?.email) {
      throw new ApiError(
        400,
        "User email is required."
      );
    }

    return emailService.sendOrderStatusEmail(
      order,
      user,
    );
  }

  async sendCustomEmail(data) {
    const { to, subject, html } = data;

    if (!to || !subject || !html) {
      throw new ApiError(
        400,
        "Recipient, subject and email content are required."
      );
    }

    return emailService.sendEmail({
      to,
      subject,
      html,
    });
  }
}

export default new NotificationService();