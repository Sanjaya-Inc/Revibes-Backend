import { z } from "zod";
import { TFirestoreData } from "./common";
import UserMission from "../models/UserMission";
import { MissionType } from "../models/MissionAssignment";

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
