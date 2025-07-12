import { z } from "zod";

export const SaveUserDeviceSchema = z.object({
  deviceToken: z
    .string({
      required_error: "USER_DEVICE.DEVICE_TOKEN_REQUIRED",
    })
    .min(1, "USER_DEVICE.FCM_TOKEN_REQUIRED"),
  fcmToken: z
    .string({
      required_error: "USER_DEVICE.FCM_TOKEN_REQUIRED",
    })
    .min(1, "USER_DEVICE.FCM_TOKEN_REQUIRED"),
  userAgent: z
    .string({
      required_error: "USER_DEVICE.USER_AGENT_REQUIRED",
    })
    .min(1, "USER_DEVICE.USER_AGENT_REQUIRED"),
});

export type TSaveUserDevice = z.infer<typeof SaveUserDeviceSchema>;

export const RemoveUserDeviceSchema = z.object({
  id: z
    .string({
      required_error: "USER_DEVICE.ID_REQUIRED",
    })
    .min(1, "USER_DEVICE.ID_REQUIRED"),
});

export type TRemoveUserDevice = z.infer<typeof RemoveUserDeviceSchema>;
