import { Router } from "express";

import uploadController from "./upload.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

import {
  uploadSingle,
  uploadMultiple,
} from "../../middleware/upload.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Upload Image
|--------------------------------------------------------------------------
*/

router.post(
  "/single",
  authMiddleware,
  adminMiddleware,
  uploadSingle,
  uploadController.uploadSingle,
);

router.post(
  "/multiple",
  authMiddleware,
  adminMiddleware,
  uploadMultiple,
  uploadController.uploadMultiple,
);

router.delete(
  "/:publicId",
  authMiddleware,
  adminMiddleware,
  uploadController.deleteImage,
);

export default router;