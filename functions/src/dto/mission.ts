import { z } from "zod";
import { MissionType } from "../models/Mission";
import { MissionAssignmentType } from "../models/MissionAssignment";
import { ImageSchema } from "./file";

export const GetMissionSchema = z.object({
  id: z
    .string({
      required_error: "MISSION.ID_REQUIRED",
    })
    .min(1, "MISSION.ID_REQUIRED"),
});

export type TGetMission = z.infer<typeof GetMissionSchema>;

export const AddMissionSchema = z.object({
  type: z.nativeEnum(MissionType, {
    errorMap: () => ({ message: "MISSION.TYPE_INVALID" }),
  }),
  title: z
    .string({
      required_error: "MISSION.TITLE_REQUIRED",
    })
    .min(1, "MISSION.TITLE_REQUIRED"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  reward: z.preprocess(
    // Preprocess function for 'amount'
    (arg) => {
      if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
        return parseFloat(arg);
      }
      return arg; // Let Zod's .number() handle invalid types
    },
    z
      .number({
        required_error: "MISSION.REWARD_REQUIRED",
        invalid_type_error: "VOUCHER.REWARD_INVALID",
      })
      .min(0, "MISSION.REWARD_MIN_INVALID"), // Add a min constraint for amount if applicable
  ),
  numOfTarget: z.preprocess(
    // Preprocess function for 'amount'
    (arg) => {
      if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
        return parseFloat(arg);
      }
      return arg; // Let Zod's .number() handle invalid types
    },
    z
      .number({
        required_error: "MISSION.REWARD_REQUIRED",
        invalid_type_error: "MISSION.REWARD_INVALID",
      })
      .min(0, "MISSION.REWARD_MIN_INVALID"), // Add a min constraint for amount if applicable
  ),
  availableUntil: z
    .preprocess(
      (arg) => {
        // If string or Date, convert to Date.
        // If null or undefined, return now.
        if (typeof arg === "string" || arg instanceof Date) {
          const date = new Date(arg);
          // Check for "Invalid Date"
          return isNaN(date.getTime()) ? new Date() : date; // If invalid, default to now
        }
        return new Date(); // Default to current date/time if no input or invalid
      },
      z.date({
        invalid_type_error: "MISSION.AVAILABLE_UNTIL_INVALID",
      }),
    )
    .optional(),
  image: ImageSchema.refine(
    (val) =>
      val !== undefined &&
      val !== null &&
      typeof val === "object" &&
      Object.keys(val).length > 0,
    {
      message: "MISSION.IMAGE_REQUIRED",
    },
  ).optional(),
});

export type TAddMission = z.infer<typeof AddMissionSchema>;

export const AssignMissionSchema = z.object({
  id: z
    .string({
      required_error: "MISSION.ID_REQUIRED",
    })
    .min(1, "MISSION.ID_REQUIRED"),
  targets: z.preprocess((val) => {
    if (typeof val === "string") {
      return [val];
    }
    if (Array.isArray(val)) {
      return val.filter((item) => typeof item === "string");
    }
    return [];
  }, z.array(z.string()).optional()),
  assignmentType: z.nativeEnum(MissionAssignmentType, {
    errorMap: () => ({ message: "MISSION.ASSIGNMENT_TYPE_INVALID" }),
  }),
});

export type TAssignMission = z.infer<typeof AssignMissionSchema>;

export const DeleteMissionSchema = z.object({
  id: z
    .string({
      required_error: "MISSION.ID_REQUIRED",
    })
    .min(1, "MISSION.ID_REQUIRED"),
});

export type TDeleteMission = z.infer<typeof DeleteMissionSchema>;
