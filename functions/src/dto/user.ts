import { z } from "zod";
import { UserRole, UserStatus } from "../models/User";

export const CreateUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("USER.EMAIL_INVALID"),
  displayName: z
    .string({
      required_error: "USER.DISPLAY_NAME_REQUIRED",
    })
    .min(3, "USER.DISPLAY_NAME_REQUIRED"),
  phoneNumber: z
    .string()
    .regex(/^(\+62|0)8[1-9][0-9]{7,10}$/, {
      message: "USER.PHONE_NUMBER_FORMAT",
    })
    .optional(),
  password: z
    .string()
    .min(6, "USER.PASS_MIN_6")
    .refine((val) => /[A-Z]/.test(val), {
      message: "USER.PASS_SHOULD_HAVE_UPPERCASE",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "USER.PASS_SHOULD_HAVE_LOWERCASE",
    })
    .refine((val) => /\d/.test(val), {
      message: "USER.PASS_SHOULD_HAVE_NUMBER",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]~`/]/.test(val), {
      message: "USER.PASS_SHOULD_HAVE_SPECIAL_CHAR",
    })
    .refine((val) => !/\s/.test(val), {
      message: "USER.PASS_SHOULD_NOT_HAVE_SPACE",
    })
    .optional(),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: "USER.ROLE_INVALID" }),
    })
    .optional(),
});

export type TCreateUser = z.infer<typeof CreateUserSchema>;

export const GetUserSchema = z.object({
  id: z
    .string({
      required_error: "USER.ID_REQUIRED",
    })
    .min(1, "USER.ID_REQUIRED"),
});

export type TGetUser = z.infer<typeof GetUserSchema>;

export const GetUserByEmailSchema = z.object({
  email: z
    .string({
      required_error: "USER.ID_REQUIRED",
    })
    .min(1, "USER.EMAIL_REQUIRED")
    .email("USER.EMAIL_INVALID"),
});

export type TGetUserByEmail = z.infer<typeof GetUserByEmailSchema>;

export const ChangeUserPasswordSchema = z.object({
  oldPassword: z
    .string({
      required_error: "USER.OLD_PASS_REQUIRED",
    })
    .min(1, "USER.OLD_PASS_REQUIRED"),
  newPassword: z
    .string({
      required_error: "USER.NEW_PASS_REQUIRED",
    })
    .min(1, "USER.NEW_PASS_REQUIRED"),
});

export type TChangeUserPassword = z.infer<typeof ChangeUserPasswordSchema>;

export const ChangeUserStatusSchema = z.object({
  id: z
    .string({
      required_error: "USER.ID_REQUIRED",
    })
    .min(1, "USER.ID_REQUIRED"),
  status: z.nativeEnum(UserStatus, {
    errorMap: () => ({ message: "USER.STATUS_INVALID" }),
  }),
});

export type TChangeUserStatus = z.infer<typeof ChangeUserStatusSchema>;
