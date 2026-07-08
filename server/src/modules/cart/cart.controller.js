import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import cartService from "./cart.service.js";

class CartController {
  getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart fetched successfully.",
        cart
      )
    );
  });

  addItem = asyncHandler(async (req, res) => {
    const cart = await cartService.addItem(
      req.user.id,
      req.body
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Item added to cart successfully.",
        cart
      )
    );
  });

  updateItem = asyncHandler(async (req, res) => {
    const cart = await cartService.updateItem(
      req.user.id,
      req.params.itemId,
      req.body
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart updated successfully.",
        cart
      )
    );
  });

  removeItem = asyncHandler(async (req, res) => {
    const cart = await cartService.removeItem(
      req.user.id,
      req.params.itemId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Item removed from cart successfully.",
        cart
      )
    );
  });

  clearCart = asyncHandler(async (req, res) => {
    const cart = await cartService.clearCart(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Cart cleared successfully.",
        cart
      )
    );
  });
}

export default new CartController();