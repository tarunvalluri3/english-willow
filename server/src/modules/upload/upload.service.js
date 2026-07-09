import streamifier from "streamifier";

import cloudinary from "../../config/cloudinary.js";

class UploadService {
  async uploadImage(file, folder) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleImages(files, folder) {
    const uploads = await Promise.all(
      files.map((file) =>
        this.uploadImage(file, folder),
      ),
    );

    return uploads;
  }

  async deleteImage(publicId) {
    await cloudinary.uploader.destroy(publicId);

    return {
      message: "Image deleted successfully.",
    };
  }
}

export default new UploadService();