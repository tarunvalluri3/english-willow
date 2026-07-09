import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import addressService from "./address.service.js";

class AddressController {
  getAddresses = asyncHandler(async (req, res) => {
    const result = await addressService.getAddresses(
      req.user.id,
      req.query,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Addresses fetched successfully.",
        result,
      ),
    );
  });

  getAddressById = asyncHandler(async (req, res) => {
    const address = await addressService.getAddressById(
      req.user.id,
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Address fetched successfully.",
        address,
      ),
    );
  });

  createAddress = asyncHandler(async (req, res) => {
    const address = await addressService.createAddress(
      req.user.id,
      req.body,
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Address created successfully.",
        address,
      ),
    );
  });

  updateAddress = asyncHandler(async (req, res) => {
    const address = await addressService.updateAddress(
      req.user.id,
      req.params.id,
      req.body,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Address updated successfully.",
        address,
      ),
    );
  });

  deleteAddress = asyncHandler(async (req, res) => {
    const result = await addressService.deleteAddress(
      req.user.id,
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        null,
      ),
    );
  });
}

export default new AddressController();