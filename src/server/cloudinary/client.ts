import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { requiredEnv } from "../env";

export function getCloudinary(): typeof cloudinary {
  cloudinary.config({
    cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requiredEnv("CLOUDINARY_API_KEY"),
    api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  return cloudinary;
}
