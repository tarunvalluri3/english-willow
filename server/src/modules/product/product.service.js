import ApiError from "../../common/ApiError.js";
import generateSlug from "../../common/slugify.js";
import { getPagination, getPaginationMeta } from "../../common/pagination.js";

import productRepository from "./product.repository.js";
import categoryRepository from "../category/category.repository.js";

class ProductService {
  async createProduct(data) {
    const category = await categoryRepository.findById(data.categoryId);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    if (category.status !== "ACTIVE") {
      throw new ApiError(400, "Category is inactive.");
    }

    const existingProductCode = await productRepository.findByProductCode(
      data.productCode,
    );

    if (existingProductCode) {
      throw new ApiError(409, "Product code already exists.");
    }

    const existingProduct = await productRepository.findByName(data.name);

    if (existingProduct) {
      throw new ApiError(409, "Product name already exists.");
    }

    const slug = generateSlug(data.name);

    const existingSlug = await productRepository.findBySlug(slug);

    if (existingSlug) {
      throw new ApiError(409, "Generated slug already exists.");
    }

    return productRepository.create({
      ...data,
      slug,
    });
  }

  async getProducts(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      search: query.search?.trim(),
      categoryId: query.categoryId,
      featured: query.featured,
    };

    const [products, totalItems] = await Promise.all([
      productRepository.findMany(filters),
      productRepository.count(filters),
    ]);

    return {
      products,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getProductById(id) {
    const product = await productRepository.findActiveById(id);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    return product;
  }

  async getProductBySlug(slug) {
    const product = await productRepository.findActiveBySlug(slug);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    return product;
  }

  async updateProduct(id, data) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new ApiError(404, "Category not found.");
      }

      if (category.status !== "ACTIVE") {
        throw new ApiError(400, "Category is inactive.");
      }
    }

    if (data.productCode) {
      const existingProductCode =
        await productRepository.findByProductCodeExceptId(data.productCode, id);

      if (existingProductCode) {
        throw new ApiError(409, "Product code already exists.");
      }
    }

    if (data.name) {
      const existingProduct = await productRepository.findByNameExceptId(
        data.name,
        id,
      );

      if (existingProduct) {
        throw new ApiError(409, "Product name already exists.");
      }

      data.slug = generateSlug(data.name);

      const existingSlug = await productRepository.findBySlug(data.slug);

      if (existingSlug && existingSlug.id !== id) {
        throw new ApiError(409, "Generated slug already exists.");
      }
    }

    return productRepository.update(id, data);
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    return productRepository.softDelete(id);
  }
}

export default new ProductService();
