export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export type TAllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
] as const;
export type TAllowedVideoType = (typeof ALLOWED_VIDEO_TYPES)[number];

export const SIZES = [
  "Bytes",
  "KB",
  "MB",
  "GB",
  "TB",
  "PB",
  "EB",
  "ZB",
  "YB",
] as const;
export type TSizeUnit = (typeof SIZES)[number];
