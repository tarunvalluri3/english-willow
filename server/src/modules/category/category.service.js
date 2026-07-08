import ApiError from "../../common/ApiError.js";
import generateSlug from "../../common/slugify.js";
import {
  getPagination,
  getPaginationMeta,
} from "../../common/pagination.js";

import categoryRepository from "./category.repository.js";

class CategoryService {
  async createCategory(data) {
    const existingCategory = await categoryRepository.findByName(data.name);

    if (existingCategory) {
      throw new ApiError(409, "Category name already exists.");
    }

    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId);

      if (!parent) {
        throw new ApiError(404, "Parent category not found.");
      }
    }

    const slug = generateSlug(data.name);

    const existingSlug = await categoryRepository.findBySlug(slug);

    if (existingSlug) {
      throw new ApiError(409, "Generated slug already exists.");
    }

    return categoryRepository.create({
      ...data,
      slug,
    });
  }

  async getCategories(query) {
    const { page, limit, skip } = getPagination(query);

    const search = query.search?.trim();

    const [categories, totalItems] = await Promise.all([
      categoryRepository.findMany({
        skip,
        take: limit,
        search,
      }),

      categoryRepository.count(search),
    ]);

    return {
      categories,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    return category;
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    if (data.parentId === id) {
      throw new ApiError(400, "A category cannot be its own parent.");
    }

    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId);

      if (!parent) {
        throw new ApiError(404, "Parent category not found.");
      }
    }

    if (data.name) {
      const existingCategory =
        await categoryRepository.findByNameExceptId(
          data.name,
          id
        );

      if (existingCategory) {
        throw new ApiError(409, "Category name already exists.");
      }

      data.slug = generateSlug(data.name);

      const existingSlug =
        await categoryRepository.findBySlug(data.slug);

      if (existingSlug && existingSlug.id !== id) {
        throw new ApiError(409, "Generated slug already exists.");
      }
    }

    return categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    return categoryRepository.softDelete(id);
  }
}

export default new CategoryService();