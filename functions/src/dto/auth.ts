import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(3, 'REQ_DISPLAY_NAME_REQUIRED'),
  phoneNumber: z.string().
    regex(/^\+[1-9]\d{9,14}$/, {
      message: "REQ_PHONE_NUMBER_FORMAT",
    })
    .optional(),
  password: z
    .string()
    .min(6, 'REQ_PASS_MIN_6')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'REQ_PASS_SHOULD_HAVE_UPPERCASE',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'REQ_PASS_SHOULD_HAVE_LOWERCASE',
    })
    .refine((val) => /\d/.test(val), {
      message: 'REQ_PASS_SHOULD_HAVE_NUMBER',
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]~`/]/.test(val), {
      message: 'REQ_PASS_SHOULD_HAVE_SPECIAL_CHAR',
    })
    .refine((val) => !/\s/.test(val), {
      message: 'REQ_PASS_SHOULD_NOT_HAVE_SPACE',
    }),
});

export type TSignup = z.infer<typeof SignupSchema>;

export type TSignupRes = {
  token: string;
};

export const SignupWithGoogleSchema = z.object({
  token: z.string().min(3, 'REQ_TOKEN_REQUIRED'),
});

export type TSignupWithGoogle = z.infer<typeof SignupWithGoogleSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, 'REQ_PASS_REQUIRED')
});

export type TLogin = z.infer<typeof LoginSchema>;

export type TTokenPairRes = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
};

export const LoginWithGoogleSchema = z.object({
  token: z.string().min(3, 'REQ_TOKEN_REQUIRED'),
});

export type TLoginWithGoogle = z.infer<typeof LoginWithGoogleSchema>;

export const RefreshSchema = z.object({
  token: z.string().min(3, 'REQ_TOKEN_REQUIRED'),
});

export type TRefresh = z.infer<typeof RefreshSchema>;
