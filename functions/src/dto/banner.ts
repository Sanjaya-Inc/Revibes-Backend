import { z } from "zod";
import { ImageSchema } from "./file";

// This schema represents the file object as parsed
export const UploadedBannerSchema = z.object({
  name: z
    .string({
      required_error: "BANNER.NAME_REQUIRED",
    })
    .min(3, "BANNER.NAME_REQUIRED"),
  image: ImageSchema.refine(
    (val) =>
      val !== undefined &&
      val !== null &&
      typeof val === "object" &&
      Object.keys(val).length > 0,
    {
      message: "BANNER.IMAGE_REQUIRED",
    },
  ),
});

export type TUploadBanner = z.infer<typeof UploadedBannerSchema>;

export const GetBannerSchema = z.object({
  id: z
    .string({
      required_error: "BANNER.ID_REQUIRED",
    })
    .min(1, "BANNER.ID_REQUIRED"),
});

export type TGetBanner = z.infer<typeof GetBannerSchema>;

export const DeleteBannerSchema = z.object({
  id: z
    .string({
      required_error: "BANNER.ID_REQUIRED",
    })
    .min(1, "BANNER.ID_REQUIRED"),
});

export type TDeleteBanner = z.infer<typeof DeleteBannerSchema>;
