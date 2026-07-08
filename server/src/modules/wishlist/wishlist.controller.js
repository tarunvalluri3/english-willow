import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import wishlistService from "./wishlist.service.js";

class WishlistController {
  getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Wishlist fetched successfully.",
        wishlist
      )
    );
  });

  addItem = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.addItem(
      req.user.id,
      req.body
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Product added to wishlist successfully.",
        wishlist
      )
    );
  });

  removeItem = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.removeItem(
      req.user.id,
      req.params.itemId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Product removed from wishlist successfully.",
        wishlist
      )
    );
  });

  clearWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.clearWishlist(
      req.user.id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Wishlist cleared successfully.",
        wishlist
      )
    );
  });
}

export default new WishlistController();