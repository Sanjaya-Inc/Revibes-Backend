import { z } from "zod";

export const GetStoreBranchSchema = z.object({
  id: z.string().min(3, "STORE.ID_REQUIRED"),
});

export type TGetStoreBranch = z.infer<typeof GetStoreBranchSchema>;
