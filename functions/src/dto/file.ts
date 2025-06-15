import { z } from "zod";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  TAllowedImageType,
  TAllowedVideoType,
} from "../constant/file";

// const formatBytes = (bytes: number, decimals = 2) => {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// };

// This schema represents the file object as parsed by Busboy
const UploadedFileSchema = z.object({
  fieldname: z.string(), // The name of the form field (e.g., 'itemFile')
  originalname: z.string(), // The original name of the file
  encoding: z.string(),
  mimetype: z.string(), // The MIME type (e.g., 'image/jpeg', 'video/mp4')
  buffer: z.instanceof(Buffer), // The file content as a Node.js Buffer
  size: z.number().int().positive(),
});

export type TUploadFile = z.infer<typeof UploadedFileSchema>;

// Specific schema for an image file
export const ImageSchema = UploadedFileSchema.refine(
  (file) => ALLOWED_IMAGE_TYPES.includes(file.mimetype as TAllowedImageType),
  "FILE.IMG_INVALID_ALLOWED_TYPE",
).refine(
  (file) => file.size <= MAX_IMAGE_SIZE,
  "FILE.IMG_INVALID_ALLOWED_SIZE",
);
// You could add dimension validation here if needed (async)

// Specific schema for a video file
export const VideoSchema = UploadedFileSchema.refine(
  (file) => ALLOWED_VIDEO_TYPES.includes(file.mimetype as TAllowedVideoType),
  "FILE.VIDEO_INVALID_ALLOWED_TYPE",
).refine(
  (file) => file.size <= MAX_VIDEO_SIZE,
  "FILE.VIDEO_INVALID_ALLOWED_SIZE",
);
