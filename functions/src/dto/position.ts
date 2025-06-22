import { z } from "zod";

export const PositionSchema = z.object({
  latitude: z
    .number({
      required_error: "POSITION.LATITUDE_REQUIRED",
    })
    .min(-90, "POSITION.LATITUDE_MIN")
    .max(90, "POSITION.LATITUDE_MAX"),
  longitude: z
    .number({
      required_error: "POSITION.LONGITUDE_REQUIRED",
    })
    .min(-180, "POSITION.LONGITUDE_MIN")
    .max(180, "POSITION.LONGITUDE_MAX"),
});

export type TPosition = z.infer<typeof PositionSchema>;
