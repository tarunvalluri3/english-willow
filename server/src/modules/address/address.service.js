import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";
import {
  getPagination,
  getPaginationMeta,
} from "../../common/pagination.js";

import addressRepository from "./address.repository.js";

class AddressService {
  async getAddresses(userId, query) {
    const { page, limit } = getPagination(query);

    const addresses = await addressRepository.findByUserId(userId);

    return {
      addresses,
      meta: getPaginationMeta(
        page,
        limit,
        addresses.length,
      ),
    };
  }

  async getAddressById(userId, addressId) {
    const address = await addressRepository.findByIdAndUser(
      addressId,
      userId,
    );

    if (!address) {
      throw new ApiError(404, "Address not found.");
    }

    return address;
  }

  async createAddress(userId, data) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        const addresses =
          await addressRepository.findByUserId(userId, tx);

        for (const address of addresses) {
          if (address.isDefault) {
            await addressRepository.update(
              address.id,
              {
                isDefault: false,
              },
              tx,
            );
          }
        }
      }

      return addressRepository.create(
        {
          userId,
          ...data,
          country: data.country || "India",
        },
        tx,
      );
    });
  }

  async updateAddress(userId, addressId, data) {
    return prisma.$transaction(async (tx) => {
      const address =
        await addressRepository.findByIdAndUser(
          addressId,
          userId,
          tx,
        );

      if (!address) {
        throw new ApiError(404, "Address not found.");
      }

      if (data.isDefault) {
        const addresses =
          await addressRepository.findByUserId(userId, tx);

        for (const item of addresses) {
          if (
            item.isDefault &&
            item.id !== address.id
          ) {
            await addressRepository.update(
              item.id,
              {
                isDefault: false,
              },
              tx,
            );
          }
        }
      }

      return addressRepository.update(
        address.id,
        data,
        tx,
      );
    });
  }

  async deleteAddress(userId, addressId) {
    return prisma.$transaction(async (tx) => {
      const address =
        await addressRepository.findByIdAndUser(
          addressId,
          userId,
          tx,
        );

      if (!address) {
        throw new ApiError(404, "Address not found.");
      }

      await addressRepository.delete(
        address.id,
        tx,
      );

      return {
        message: "Address deleted successfully.",
      };
    });
  }
}

export default new AddressService();