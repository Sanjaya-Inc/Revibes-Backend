import { z } from "zod";

export const PointSchema = z.object({
  organic: z.number().optional(),
  "non-organic": z.number().optional(),
  b3: z.number().optional(),
});

export const UpdateAppSettingSchema = z.object({
  point: PointSchema,
});

export type TUpdateAppSetting = z.infer<typeof UpdateAppSettingSchema>;
