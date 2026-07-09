import prisma from "../../config/prisma.js";

class ClerkWebhookService {
  async handleUserCreated(data) {
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkUserId: data.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    return prisma.user.create({
      data: {
        clerkUserId: data.id,

        firstName: data.first_name,

        lastName: data.last_name,

        email: data.email_addresses[0].email_address,

        phone: data.phone_numbers?.[0]?.phone_number,

        profileImageUrl: data.image_url,

        role: "CUSTOMER",

        status: "ACTIVE",
      },
    });
  }

  async handleUserUpdated(data) {
    return prisma.user.update({
      where: {
        clerkUserId: data.id,
      },

      data: {
        firstName: data.first_name,

        lastName: data.last_name,

        email: data.email_addresses[0].email_address,

        phone: data.phone_numbers?.[0]?.phone_number,

        profileImageUrl: data.image_url,
      },
    });
  }

  async handleUserDeleted(data) {
    return prisma.user.update({
      where: {
        clerkUserId: data.id,
      },

      data: {
        status: "INACTIVE",

        deletedAt: new Date(),
      },
    });
  }
}

export default new ClerkWebhookService();