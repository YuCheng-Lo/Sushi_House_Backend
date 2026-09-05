import cloudinary from "../lib/cloudinary.js";
import AppError from "../utils/AppError.js";
import { httpStatus } from "../constants/constants.js";
import type { CloudinaryUploadResult } from "../types/image.js";

const uploadToCloudinary = (
  fileBuffer: Buffer,
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "sushi_house_menu",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(
            new AppError("圖片上傳失敗", httpStatus.INTERNAL_SERVER_ERROR),
          );
        }

        resolve({
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export const upload = async (data: Express.Multer.File) => {
  const { buffer } = data;
  const result = await uploadToCloudinary(buffer);

  return result;
};
