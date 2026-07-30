import { z } from "zod";

export const CreateNewsSchema = z.object({
  title: z
    .string({
      required_error: "NEWS.TITLE_REQUIRED",
    })
    .min(1, "NEWS.TITLE_REQUIRED"),
  content: z
    .string({
      required_error: "NEWS.CONTENT_REQUIRED",
    })
    .min(1, "NEWS.CONTENT_REQUIRED"),
});

export type TCreateNews = z.infer<typeof CreateNewsSchema>;

export const UpdateNewsSchema = z.object({
  title: z.string().min(1, "NEWS.TITLE_REQUIRED").optional(),
  content: z.string().min(1, "NEWS.CONTENT_REQUIRED").optional(),
});

export type TUpdateNews = z.infer<typeof UpdateNewsSchema>;
