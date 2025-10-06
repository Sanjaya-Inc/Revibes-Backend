import { z } from "zod";
import { TUserMetadata } from "../models/User";
import PhoneNumberUtil from "../utils/phoneNumber";

export type TTokenPairRes = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: Date;
  refreshTokenExpiredAt: Date;
};

const passwordValidation = z
  .string({
    required_error: "AUTH.PASS_REQUIRED",
  })
  .min(6, "AUTH.PASS_MIN_6")
  .refine((val) => /[A-Z]/.test(val), {
    message: "AUTH.PASS_SHOULD_HAVE_UPPERCASE",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "AUTH.PASS_SHOULD_HAVE_LOWERCASE",
  })
  .refine((val) => /\d/.test(val), {
    message: "AUTH.PASS_SHOULD_HAVE_NUMBER",
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]~`/]/.test(val), {
    message: "AUTH.PASS_SHOULD_HAVE_SPECIAL_CHAR",
  })
  .refine((val) => !/\s/.test(val), {
    message: "AUTH.PASS_SHOULD_NOT_HAVE_SPACE",
  });

export const SignupSchema = z.object({
  email: z
    .string({
      required_error: "AUTH.EMAIL_INVALID",
    })
    .email("AUTH.EMAIL_INVALID"),
  displayName: z
    .string({
      required_error: "AUTH.DISPLAY_NAME_REQUIRED",
    })
    .min(3, "AUTH.DISPLAY_NAME_REQUIRED"),
  phoneNumber: z
    .string()
    .regex(/^(\+62|0)8[1-9][0-9]{7,10}$/, {
      message: "AUTH.PHONE_NUMBER_FORMAT",
    })
    .optional(),
  password: passwordValidation,
});

export const SignupPhoneSchema = z.object({
  phoneNumber: z
    .string({
      required_error: "AUTH.PHONE_NUMBER_REQUIRED",
    })
    .regex(/^(\+62|0|62)?8[1-9][0-9]{7,10}$/, {
      message: "AUTH.PHONE_NUMBER_FORMAT",
    }),
  displayName: z
    .string({
      required_error: "AUTH.DISPLAY_NAME_REQUIRED",
    })
    .min(3, "AUTH.DISPLAY_NAME_REQUIRED"),
  email: z
    .string()
    .email("AUTH.EMAIL_INVALID")
    .optional(),
  password: passwordValidation,
});

export type TSignup = z.infer<typeof SignupSchema>;
export type TSignupPhone = z.infer<typeof SignupPhoneSchema>;

export type TSignupRes = {
  user: TUserMetadata;
  tokens: TTokenPairRes;
};

export const SignupWithGoogleSchema = z.object({
  token: z
    .string({
      required_error: "AUTH.TOKEN_REQUIRED",
    })
    .min(3, "AUTH.TOKEN_REQUIRED"),
});

export type TSignupWithGoogle = z.infer<typeof SignupWithGoogleSchema>;

export const LoginSchema = z.object({
  identifier: z
    .string({
      required_error: "AUTH.IDENTIFIER_REQUIRED",
    })
    .min(1, "AUTH.IDENTIFIER_REQUIRED")
    .refine(
      (val) => PhoneNumberUtil.isEmail(val) || PhoneNumberUtil.isPhoneNumber(val),
      {
        message: "AUTH.IDENTIFIER_INVALID",
      }
    ),
  password: z
    .string({
      required_error: "AUTH.PASS_REQUIRED",
    })
    .min(6, "AUTH.PASS_REQUIRED"),
});

export const LoginEmailSchema = z.object({
  email: z.string().email("AUTH.EMAIL_INVALID"),
  password: z
    .string({
      required_error: "AUTH.PASS_REQUIRED",
    })
    .min(6, "AUTH.PASS_REQUIRED"),
});

export const LoginPhoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^(\+62|0|62)?8[1-9][0-9]{7,10}$/, {
      message: "AUTH.PHONE_NUMBER_FORMAT",
    }),
  password: z
    .string({
      required_error: "AUTH.PASS_REQUIRED",
    })
    .min(6, "AUTH.PASS_REQUIRED"),
});

export type TLogin = z.infer<typeof LoginSchema>;
export type TLoginEmail = z.infer<typeof LoginEmailSchema>;
export type TLoginPhone = z.infer<typeof LoginPhoneSchema>;

export type TLoginRes = {
  user: TUserMetadata;
  tokens: TTokenPairRes;
};

export const LoginWithGoogleSchema = z.object({
  token: z
    .string({
      required_error: "AUTH.TOKEN_REQUIRED",
    })
    .min(3, "AUTH.TOKEN_REQUIRED"),
});

export type TLoginWithGoogle = z.infer<typeof LoginWithGoogleSchema>;

export type TLoginWithGoogleRes = {
  user: TUserMetadata;
  tokens: TTokenPairRes;
};

export const RefreshSchema = z.object({
  token: z
    .string({
      required_error: "AUTH.TOKEN_REQUIRED",
    })
    .min(3, "AUTH.TOKEN_REQUIRED"),
});

export type TRefresh = z.infer<typeof RefreshSchema>;
