import z from "zod";
import { UserPointHistorySourceType } from "../models/UserPointHistory";

export const NewUserPointSchema = z.object({
  amount: z.number({
    required_error: "USER.AMOUNT_REQUIRED",
  }),
  sourceType: z.nativeEnum(UserPointHistorySourceType).optional(),
  sourceId: z.string().optional(),
});

export type TNewUserPoint = z.infer<typeof NewUserPointSchema>;
