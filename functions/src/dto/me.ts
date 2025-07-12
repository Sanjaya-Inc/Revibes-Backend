import { z } from "zod";

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string({
      required_error: "ME.OLD_PASS_REQUIRED",
    })
    .min(1, "ME.OLD_PASS_REQUIRED"),
  newPassword: z
    .string({
      required_error: "ME.NEW_PASS_REQUIRED",
    })
    .min(1, "ME.NEW_PASS_REQUIRED"),
});

export type TChangePassword = z.infer<typeof ChangePasswordSchema>;
