import { TDailyReward } from "./AppSetting";

/** Day amounts for one claim cycle. index is 1-based. */
export function dailyRewardAmounts(reward: TDailyReward): number[] {
  const days = reward?.days || 7;
  const initialPoint = reward?.initialPoint || 1;
  return Array.from({ length: days }, () => initialPoint);
}
