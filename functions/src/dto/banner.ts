import { z } from "zod";
import { ImageSchema } from "./file";

// This schema represents the file object as parsed by Busboy
export const UploadedBannerSchema = z.object({
  name: z.string().min(3, "BANNER.NAME_REQUIRED"),
  image: ImageSchema,
});

export type TUploadBanner = z.infer<typeof UploadedBannerSchema>;

export const RemoveBannerSchema = z.object({
  id: z.string().min(1, "BANNER.ID_REQUIRED"),
});

export type TRemoveBanner = z.infer<typeof RemoveBannerSchema>;
