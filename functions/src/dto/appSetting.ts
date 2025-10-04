import { z } from "zod";

export const PointSchema = z.object({
  organic: z.number().optional(),
  "non-organic": z.number().optional(),
  b3: z.number().optional(),
});

export const DailyRewardSchema = z.object({
  days: z.number().optional(),
  initialPoint: z.number().optional(),
  multiplier: z.number().optional(),
});

export const UpdateAppSettingSchema = z.object({
  point: PointSchema,
  dailyReward: DailyRewardSchema,
});

export type TUpdateAppSetting = z.infer<typeof UpdateAppSettingSchema>;
