import { z } from "zod";

export const AddCountrySchema = z.object({
  code: z
    .string({
      required_error: "COUNTRY.CODE_REQUIRED",
    })
    .min(2, "COUNTRY.CODE_REQUIRED"),
  name: z
    .string({
      required_error: "COUNTRY.NAME_REQUIRED",
    })
    .min(3, "COUNTRY.NAME_REQUIRED"),
  dialCode: z
    .string({
      required_error: "COUNTRY.DIAL_CODE_REQUIRED",
    })
    .min(2, "COUNTRY.DIAL_CODE_MIN_2")
    .max(4, "COUNTRY.DIAL_CODE_MAX_4"),
  visible: z.boolean().default(true),
});

export type TAddCountry = z.infer<typeof AddCountrySchema>;

export const EditCountrySchema = z.object({
  ...AddCountrySchema.shape,
});

export type TEditCountry = z.infer<typeof EditCountrySchema>;

export const GetCountrySchema = z.object({
  code: z
    .string({
      required_error: "COUNTRY.CODE_REQUIRED",
    })
    .min(1, "COUNTRY.CODE_REQUIRED"),
});

export type TGetCountry = z.infer<typeof GetCountrySchema>;

export const DeleteCountrySchema = z.object({
  code: z
    .string({
      required_error: "COUNTRY.CODE_REQUIRED",
    })
    .min(1, "COUNTRY.CODE_REQUIRED"),
});

export type TDeleteCountry = z.infer<typeof DeleteCountrySchema>;
