import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import productService from "./product.service.js";

class ProductController {
  createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);

    return res
      .status(201)
      .json(new ApiResponse(201, "Product created successfully.", product));
  });

  getProducts = asyncHandler(async (req, res) => {
    const { products, meta } = await productService.getProducts(req.query);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Products fetched successfully.", products, meta),
      );
  });

  getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Product fetched successfully.", product));
  });

  getProductBySlug = asyncHandler(async (req, res) => {
    const product = await productService.getProductBySlug(req.params.slug);

    return res
      .status(200)
      .json(new ApiResponse(200, "Product fetched successfully.", product));
  });

  updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);

    return res
      .status(200)
      .json(new ApiResponse(200, "Product updated successfully.", product));
  });

  deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Product deleted successfully.", null));
  });
}

export default new ProductController();
