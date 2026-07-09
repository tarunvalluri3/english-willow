import { Router } from "express";

import addressController from "./address.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
  deleteAddressSchema,
  listAddressesSchema,
} from "./address.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Address Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  validate(listAddressesSchema),
  addressController.getAddresses
);

router.get(
  "/:id",
  authMiddleware,
  validate(addressIdSchema),
  addressController.getAddressById
);

router.post(
  "/",
  authMiddleware,
  validate(createAddressSchema),
  addressController.createAddress
);

router.patch(
  "/:id",
  authMiddleware,
  validate(updateAddressSchema),
  addressController.updateAddress
);

router.delete(
  "/:id",
  authMiddleware,
  validate(deleteAddressSchema),
  addressController.deleteAddress
);

export default router;