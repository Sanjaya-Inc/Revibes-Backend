import { z } from "zod";
import { TFirestoreData } from "./common";
import UserMission, { UserMissionStatus } from "../models/UserMission";
import { MissionType } from "../models/Mission";
import { PaginationSchema } from "./pagination";

export const GetMissionsSchema = z.object({
  ...PaginationSchema.shape,
  statuses: z
    .preprocess(
      // Preprocess function for 'amount'
      (arg) => {
        if (typeof arg === "string") {
          return arg.split(",");
        }
        return arg; // Let Zod's .array() handle invalid types
      },
      z.array(z.nativeEnum(UserMissionStatus)).optional(),
    )
    .optional(),
});

export type TGetMissions = z.infer<typeof GetMissionsSchema>;

export const GetMissionSchema = z.object({
  id: z
    .string({
      required_error: "MISSION.ID_REQUIRED",
    })
    .min(1, "MISSION.ID_REQUIRED"),
});

export type TGetMission = z.infer<typeof GetMissionSchema>;

export const UpdateMissionProgressByTypeSchema = z.object({
  type: z.nativeEnum(MissionType),
  progress: z.number().default(1).optional(),
});

export type TUpdateMissionProgressByType = z.infer<
  typeof UpdateMissionProgressByTypeSchema
>;

export const ClaimMissionSchema = z.object({
  id: z
    .string({
      required_error: "MISSION.ID_REQUIRED",
    })
    .min(1, "MISSION.ID_REQUIRED"),
});

export type TClaimMission = z.infer<typeof ClaimMissionSchema>;

export type TGetUserMissionRes = TFirestoreData<UserMission>;
