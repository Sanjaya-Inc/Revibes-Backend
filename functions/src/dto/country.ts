import { z } from "zod";

export const AddCountrySchema = z.object({
  code: z.string().min(2, "AUTH.CODE_REQUIRED"),
  name: z.string().min(3, "AUTH.NAME_REQUIRED"),
  dialCode: z
    .string()
    .min(3, "AUTH.DIAL_CODE_REQUIRED")
    .max(3, "AUTH.DIAL_CODE_REQUIRED"),
  visible: z.boolean().default(true),
});

export type TAddCountry = z.infer<typeof AddCountrySchema>;
