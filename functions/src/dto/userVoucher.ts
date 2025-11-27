import z from "zod";
import { TFirestoreData } from "./common";
import UserVoucher, { UserVoucherStatus } from "../models/UserVoucher";

export const GetUserVoucherSchema = z.object({
  id: z.string().optional(),
  code: z
    .string({
      required_error: "USER_VOUCHER.CODE_REQUIRED",
    })
    .min(1, "USER_VOUCHER.CODE_REQUIRED"),
  status: z.nativeEnum(UserVoucherStatus).optional(),
});

export type TGetUserVoucher = z.infer<typeof GetUserVoucherSchema>;

export type TGetUserVoucherRes = TFirestoreData<UserVoucher>;

export const GetUserVouchersSchema = z.object({
  id: z.string().optional(),
  codes: z
    .array(
      z.string({
        required_error: "USER_VOUCHER.CODE_REQUIRED",
      }),
    )
    .min(1, "USER_VOUCHER.CODES_REQUIRED"),
  status: z.nativeEnum(UserVoucherStatus).optional(),
});

export type TGetUserVouchers = z.infer<typeof GetUserVouchersSchema>;

export type TGetUserVouchersRes = TFirestoreData<UserVoucher>[];
