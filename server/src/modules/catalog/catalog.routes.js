import { Router } from "express";

import prisma from "../../config/prisma.js";
import ApiError from "../../common/ApiError.js";
import ApiResponse from "../../common/ApiResponse.js";
import asyncHandler from "../../common/asyncHandler.js";
import generateSlug from "../../common/slugify.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

const send = (res, statusCode, message, data = null) =>
  res.status(statusCode).json(new ApiResponse(statusCode, message, data));

const requireProduct = async (productId, tx = prisma) => {
  const product = await tx.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) throw new ApiError(404, "Product not found.");
  return product;
};

/* Complete product data for the admin product editor. */
router.get(
  "/products/:productId",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { id: req.params.productId, deletedAt: null },
      include: {
        category: true,
        variants: {
          where: { deletedAt: null },
          include: {
            inventory: true,
            attributeValues: {
              include: { attribute: true, attributeValue: true },
            },
            images: true,
          },
        },
        images: true,
        productAttributes: {
          include: { attribute: true, attributeValue: true },
        },
        collections: { include: { collection: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!product) throw new ApiError(404, "Product not found.");
    return send(res, 200, "Catalog product fetched successfully.", product);
  }),
);

/* Product variants and their inventory record. */
router.post(
  "/products/:productId/variants",
  asyncHandler(async (req, res) => {
    const {
      sku,
      price,
      compareAtPrice,
      costPrice,
      barcode,
      weight,
      status,
      isDefault = false,
      quantityAvailable = 0,
      lowStockThreshold = 5,
    } = req.body;
    if (!sku || price === undefined)
      throw new ApiError(400, "sku and price are required.");
    const variant = await prisma.$transaction(async (tx) => {
      await requireProduct(req.params.productId, tx);
      if (isDefault)
        await tx.productVariant.updateMany({
          where: { productId: req.params.productId },
          data: { isDefault: false },
        });
      const created = await tx.productVariant.create({
        data: {
          productId: req.params.productId,
          sku,
          price,
          compareAtPrice,
          costPrice,
          barcode,
          weight,
          status,
          isDefault,
        },
      });
      await tx.inventory.create({
        data: {
          productVariantId: created.id,
          quantityAvailable,
          lowStockThreshold,
          lastStockUpdatedAt: new Date(),
        },
      });
      return tx.productVariant.findUnique({
        where: { id: created.id },
        include: { inventory: true },
      });
    });
    return send(res, 201, "Product variant created successfully.", variant);
  }),
);

router.patch(
  "/variants/:variantId",
  asyncHandler(async (req, res) => {
    const { quantityAvailable, lowStockThreshold, ...variantData } = req.body;
    const variant = await prisma.$transaction(async (tx) => {
      const existing = await tx.productVariant.findFirst({
        where: { id: req.params.variantId, deletedAt: null },
      });
      if (!existing) throw new ApiError(404, "Product variant not found.");
      if (variantData.isDefault)
        await tx.productVariant.updateMany({
          where: { productId: existing.productId, NOT: { id: existing.id } },
          data: { isDefault: false },
        });
      if (Object.keys(variantData).length)
        await tx.productVariant.update({
          where: { id: existing.id },
          data: variantData,
        });
      if (quantityAvailable !== undefined || lowStockThreshold !== undefined)
        await tx.inventory.update({
          where: { productVariantId: existing.id },
          data: {
            ...(quantityAvailable !== undefined && {
              quantityAvailable,
              lastStockUpdatedAt: new Date(),
            }),
            ...(lowStockThreshold !== undefined && { lowStockThreshold }),
          },
        });
      return tx.productVariant.findUnique({
        where: { id: existing.id },
        include: { inventory: true },
      });
    });
    return send(res, 200, "Product variant updated successfully.", variant);
  }),
);

router.delete(
  "/variants/:variantId",
  asyncHandler(async (req, res) => {
    const variant = await prisma.productVariant.findFirst({
      where: { id: req.params.variantId, deletedAt: null },
    });
    if (!variant) throw new ApiError(404, "Product variant not found.");
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { status: "ARCHIVED", deletedAt: new Date(), isDefault: false },
    });
    return send(res, 200, "Product variant archived successfully.");
  }),
);

/* Images are uploaded first through /api/uploads, then attached here. */
router.post(
  "/products/:productId/images",
  asyncHandler(async (req, res) => {
    const {
      imageUrl,
      cloudinaryPublicId,
      altText,
      displayOrder = 0,
      isPrimary = false,
      productVariantId,
    } = req.body;
    if (!imageUrl) throw new ApiError(400, "imageUrl is required.");
    const image = await prisma.$transaction(async (tx) => {
      await requireProduct(req.params.productId, tx);
      if (productVariantId) {
        const variant = await tx.productVariant.findFirst({
          where: {
            id: productVariantId,
            productId: req.params.productId,
            deletedAt: null,
          },
        });
        if (!variant)
          throw new ApiError(
            400,
            "Product variant does not belong to this product.",
          );
      }
      if (isPrimary)
        await tx.productImage.updateMany({
          where: {
            productId: req.params.productId,
            productVariantId: productVariantId ?? null,
          },
          data: { isPrimary: false },
        });
      return tx.productImage.create({
        data: {
          productId: req.params.productId,
          imageUrl,
          cloudinaryPublicId,
          altText,
          displayOrder,
          isPrimary,
          productVariantId,
        },
      });
    });
    return send(res, 201, "Product image attached successfully.", image);
  }),
);

router.patch(
  "/images/:imageId",
  asyncHandler(async (req, res) => {
    const image = await prisma.productImage.findUnique({
      where: { id: req.params.imageId },
    });
    if (!image) throw new ApiError(404, "Product image not found.");
    const updated = await prisma.$transaction(async (tx) => {
      if (req.body.isPrimary)
        await tx.productImage.updateMany({
          where: {
            productId: image.productId,
            productVariantId: image.productVariantId,
            NOT: { id: image.id },
          },
          data: { isPrimary: false },
        });
      return tx.productImage.update({
        where: { id: image.id },
        data: req.body,
      });
    });
    return send(res, 200, "Product image updated successfully.", updated);
  }),
);

router.delete(
  "/images/:imageId",
  asyncHandler(async (req, res) => {
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    return send(res, 200, "Product image detached successfully.");
  }),
);

/* Attributes and their selectable values. */
router.get(
  "/attributes",
  asyncHandler(async (req, res) =>
    send(
      res,
      200,
      "Attributes fetched successfully.",
      await prisma.attribute.findMany({
        include: { values: { orderBy: { displayOrder: "asc" } } },
        orderBy: { displayOrder: "asc" },
      }),
    ),
  ),
);
router.post(
  "/attributes",
  asyncHandler(async (req, res) => {
    const {
      name,
      type,
      displayOrder = 0,
      isRequired = false,
      isFilterable = true,
      status = "ACTIVE",
    } = req.body;
    if (!name || !type) throw new ApiError(400, "name and type are required.");
    const attribute = await prisma.attribute.create({
      data: {
        name,
        slug: generateSlug(name),
        type,
        displayOrder,
        isRequired,
        isFilterable,
        status,
      },
    });
    return send(res, 201, "Attribute created successfully.", attribute);
  }),
);
router.patch(
  "/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.name) data.slug = generateSlug(data.name);
    return send(
      res,
      200,
      "Attribute updated successfully.",
      await prisma.attribute.update({
        where: { id: req.params.attributeId },
        data,
      }),
    );
  }),
);
router.delete(
  "/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    await prisma.attribute.delete({ where: { id: req.params.attributeId } });
    return send(res, 200, "Attribute deleted successfully.");
  }),
);
router.post(
  "/attributes/:attributeId/values",
  asyncHandler(async (req, res) => {
    const { value, displayOrder = 0, colorCode } = req.body;
    if (!value) throw new ApiError(400, "value is required.");
    const attributeValue = await prisma.attributeValue.create({
      data: {
        attributeId: req.params.attributeId,
        value,
        slug: generateSlug(value),
        displayOrder,
        colorCode,
      },
    });
    return send(
      res,
      201,
      "Attribute value created successfully.",
      attributeValue,
    );
  }),
);
router.patch(
  "/attribute-values/:valueId",
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.value) data.slug = generateSlug(data.value);
    return send(
      res,
      200,
      "Attribute value updated successfully.",
      await prisma.attributeValue.update({
        where: { id: req.params.valueId },
        data,
      }),
    );
  }),
);
router.delete(
  "/attribute-values/:valueId",
  asyncHandler(async (req, res) => {
    await prisma.attributeValue.delete({ where: { id: req.params.valueId } });
    return send(res, 200, "Attribute value deleted successfully.");
  }),
);

/* Product and variant attribute assignments. */
router.put(
  "/products/:productId/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    await requireProduct(req.params.productId);
    const result = await prisma.productAttributeValue.upsert({
      where: {
        productId_attributeId: {
          productId: req.params.productId,
          attributeId: req.params.attributeId,
        },
      },
      update: { attributeValueId: req.body.attributeValueId },
      create: {
        productId: req.params.productId,
        attributeId: req.params.attributeId,
        attributeValueId: req.body.attributeValueId,
      },
    });
    return send(res, 200, "Product attribute assigned successfully.", result);
  }),
);
router.delete(
  "/products/:productId/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    await prisma.productAttributeValue.delete({
      where: {
        productId_attributeId: {
          productId: req.params.productId,
          attributeId: req.params.attributeId,
        },
      },
    });
    return send(res, 200, "Product attribute removed successfully.");
  }),
);
router.put(
  "/variants/:variantId/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    const result = await prisma.variantAttributeValue.upsert({
      where: {
        productVariantId_attributeId: {
          productVariantId: req.params.variantId,
          attributeId: req.params.attributeId,
        },
      },
      update: { attributeValueId: req.body.attributeValueId },
      create: {
        productVariantId: req.params.variantId,
        attributeId: req.params.attributeId,
        attributeValueId: req.body.attributeValueId,
      },
    });
    return send(res, 200, "Variant attribute assigned successfully.", result);
  }),
);
router.delete(
  "/variants/:variantId/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    await prisma.variantAttributeValue.delete({
      where: {
        productVariantId_attributeId: {
          productVariantId: req.params.variantId,
          attributeId: req.params.attributeId,
        },
      },
    });
    return send(res, 200, "Variant attribute removed successfully.");
  }),
);

/* Collections and tags. */
const collectionData = (body) => {
  const data = { ...body };
  if (data.name) data.slug = generateSlug(data.name);
  return data;
};
router.get(
  "/collections",
  asyncHandler(async (req, res) =>
    send(
      res,
      200,
      "Collections fetched successfully.",
      await prisma.collection.findMany({
        where: { deletedAt: null },
        orderBy: { displayOrder: "asc" },
      }),
    ),
  ),
);
router.post(
  "/collections",
  asyncHandler(async (req, res) => {
    if (!req.body.name) throw new ApiError(400, "name is required.");
    return send(
      res,
      201,
      "Collection created successfully.",
      await prisma.collection.create({ data: collectionData(req.body) }),
    );
  }),
);
router.patch(
  "/collections/:collectionId",
  asyncHandler(async (req, res) =>
    send(
      res,
      200,
      "Collection updated successfully.",
      await prisma.collection.update({
        where: { id: req.params.collectionId },
        data: collectionData(req.body),
      }),
    ),
  ),
);
router.delete(
  "/collections/:collectionId",
  asyncHandler(async (req, res) => {
    await prisma.collection.update({
      where: { id: req.params.collectionId },
      data: { status: "ARCHIVED", deletedAt: new Date() },
    });
    return send(res, 200, "Collection archived successfully.");
  }),
);
router.get(
  "/tags",
  asyncHandler(async (req, res) =>
    send(
      res,
      200,
      "Tags fetched successfully.",
      await prisma.tag.findMany({ orderBy: { displayOrder: "asc" } }),
    ),
  ),
);
router.post(
  "/tags",
  asyncHandler(async (req, res) => {
    if (!req.body.name) throw new ApiError(400, "name is required.");
    const data = { ...req.body, slug: generateSlug(req.body.name) };
    return send(
      res,
      201,
      "Tag created successfully.",
      await prisma.tag.create({ data }),
    );
  }),
);
router.patch(
  "/tags/:tagId",
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.name) data.slug = generateSlug(data.name);
    return send(
      res,
      200,
      "Tag updated successfully.",
      await prisma.tag.update({ where: { id: req.params.tagId }, data }),
    );
  }),
);
router.delete(
  "/tags/:tagId",
  asyncHandler(async (req, res) => {
    await prisma.$transaction(async (tx) => {
      await tx.productTag.deleteMany({ where: { tagId: req.params.tagId } });
      await tx.tag.delete({ where: { id: req.params.tagId } });
    });
    return send(res, 200, "Tag deleted successfully.");
  }),
);

router.put(
  "/products/:productId/tags/:tagId",
  asyncHandler(async (req, res) =>
    send(
      res,
      200,
      "Tag assigned successfully.",
      await prisma.productTag.upsert({
        where: {
          productId_tagId: {
            productId: req.params.productId,
            tagId: req.params.tagId,
          },
        },
        update: {},
        create: { productId: req.params.productId, tagId: req.params.tagId },
      }),
    ),
  ),
);
router.delete(
  "/products/:productId/tags/:tagId",
  asyncHandler(async (req, res) => {
    await prisma.productTag.delete({
      where: {
        productId_tagId: {
          productId: req.params.productId,
          tagId: req.params.tagId,
        },
      },
    });
    return send(res, 200, "Tag removed successfully.");
  }),
);
router.put(
  "/products/:productId/collections/:collectionId",
  asyncHandler(async (req, res) =>
    send(
      res,
      200,
      "Collection assigned successfully.",
      await prisma.productCollection.upsert({
        where: {
          productId_collectionId: {
            productId: req.params.productId,
            collectionId: req.params.collectionId,
          },
        },
        update: {},
        create: {
          productId: req.params.productId,
          collectionId: req.params.collectionId,
        },
      }),
    ),
  ),
);
router.delete(
  "/products/:productId/collections/:collectionId",
  asyncHandler(async (req, res) => {
    await prisma.productCollection.delete({
      where: {
        productId_collectionId: {
          productId: req.params.productId,
          collectionId: req.params.collectionId,
        },
      },
    });
    return send(res, 200, "Collection removed successfully.");
  }),
);

export default router;
