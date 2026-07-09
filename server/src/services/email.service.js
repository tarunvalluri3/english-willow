import resend from "../config/resend.js";

class EmailService {
  async sendEmail({
    to,
    subject,
    html,
    from = "English Willow <onboarding@resend.dev>",
  }) {
    return resend.emails.send({
      from,
      to,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: "Welcome to English Willow",
      html: `
        <h2>Welcome ${user.firstName || ""}!</h2>

        <p>Thank you for joining English Willow.</p>

        <p>We're excited to have you with us.</p>
      `,
    });
  }

  async sendOrderPlacedEmail(order, user) {
    return this.sendEmail({
      to: user.email,
      subject: `Order ${order.orderNumber} Placed`,
      html: `
        <h2>Thank you for your order.</h2>

        <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>

        <p>Total Amount: ₹${order.totalAmount}</p>
      `,
    });
  }

  async sendOrderStatusEmail(order, user) {
    return this.sendEmail({
      to: user.email,
      subject: `Order ${order.orderNumber} ${order.status}`,
      html: `
        <h2>Order Update</h2>

        <p>Your order status is now <strong>${order.status}</strong>.</p>
      `,
    });
  }
}

export default new EmailService();