import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import uploadService from "./upload.service.js";

class UploadController {
  uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(
          400,
          "Please upload an image.",
        ),
      );
    }

    const result = await uploadService.uploadImage(
      req.file,
      req.body.folder || "english-willow",
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Image uploaded successfully.",
        result,
      ),
    );
  });

  uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(
        new ApiResponse(
          400,
          "Please upload at least one image.",
        ),
      );
    }

    const result =
      await uploadService.uploadMultipleImages(
        req.files,
        req.body.folder || "english-willow",
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Images uploaded successfully.",
        result,
      ),
    );
  });

  deleteImage = asyncHandler(async (req, res) => {
    const result = await uploadService.deleteImage(
      req.params.publicId,
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

export default new UploadController();