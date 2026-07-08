import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import categoryService from "./category.service.js";

class CategoryController {
  createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json(
      new ApiResponse(
        201,
        "Category created successfully.",
        category
      )
    );
  });

  getCategories = asyncHandler(async (req, res) => {
    const { categories, meta } =
      await categoryService.getCategories(req.query);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Categories fetched successfully.",
        categories,
        meta
      )
    );
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(
      req.params.id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Category fetched successfully.",
        category
      )
    );
  });

  updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Category updated successfully.",
        category
      )
    );
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Category deleted successfully.",
        null
      )
    );
  });
}

export default new CategoryController();