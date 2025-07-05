import { z } from "zod";
import { PositionSchema } from "./position";
import { BranchStoreStatus } from "../models/StoreBranch";
import { PaginationSchema } from "./pagination";

export const GetStoreBranchSchema = z.object({
  id: z.string({
    required_error: "STORE.ID_REQUIRED",
  }),
});

export type TGetStoreBranch = z.infer<typeof GetStoreBranchSchema>;

export const AddStoreBranchSchema = z.object({
  name: z
    .string({
      required_error: "STORE.NAME_REQUIRED",
    })
    .min(3, "STORE.NAME_REQUIRED"),
  country: z
    .string({
      required_error: "STORE.COUNTRY_CODE_REQUIRED",
    })
    .min(2, "STORE.COUNTRY_CODE_MIN_2"),
  address: z
    .string({
      required_error: "STORE.ADDRESS_REQUIRED",
    })
    .min(1, "STORE.ADDRESS_REQUIRED"),
  postalCode: z
    .string({
      required_error: "STORE.POSTAL_CODE_REQUIRED",
    })
    .min(1, "STORE.POSTAL_CODE_REQUIRED"),
  position: PositionSchema.optional(),
});

export type TAddStoreBranch = z.infer<typeof AddStoreBranchSchema>;

export const EditStoreBranchSchema = z.object({
  id: z.string({
    required_error: "STORE.ID_REQUIRED",
  }),
  status: z
    .nativeEnum(BranchStoreStatus, {
      errorMap: () => ({ message: "STORE.STATUS_INVALID" }),
    })
    .optional(),
  ...AddStoreBranchSchema.shape,
});

export type TEditStoreBranch = z.infer<typeof EditStoreBranchSchema>;

export const GetStoreBranchesSchema = z
  .object({
    ...PaginationSchema.shape,
    longitude: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined))
      .refine(
        (val) => val === undefined || !isNaN(val),
        { message: "STORE.LONGITUDE_MUST_BE_NUMBER" }
      ),
    latitude: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined))
      .refine(
        (val) => val === undefined || !isNaN(val),
        { message: "STORE.LATITUDE_MUST_BE_NUMBER" }
      ),
  })
  .refine(
    (data) =>
      (data.longitude === undefined && data.latitude === undefined) ||
      (data.longitude !== undefined && data.latitude !== undefined),
    {
      message: "STORE.BOTH_LONGITUDE_LATITUDE_REQUIRED",
      path: ["longitude", "latitude"],
    }
  );

export type TGetStoreBranches = z.infer<typeof GetStoreBranchesSchema>;

export const DeleteStoreBranchSchema = z.object({
  id: z.string({
    required_error: "STORE.ID_REQUIRED",
  }),
});

export type TDeleteStoreBranch = z.infer<typeof DeleteStoreBranchSchema>;
