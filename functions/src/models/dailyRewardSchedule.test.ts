import assert from "node:assert";
import { describe, it } from "node:test";
import { defaultAppSettingData } from "./AppSetting";
import { dailyRewardAmounts } from "./dailyRewardSchedule";

describe("dailyRewardAmounts", () => {
  it("default schedule uses initialPoint for every day", () => {
    const amounts = dailyRewardAmounts(defaultAppSettingData.dailyReward!);

    assert.deepStrictEqual(amounts, [1, 1, 1, 1, 1, 1, 1]);
  });

  it("uses initialPoint as flat amount ignoring multiplier", () => {
    const amounts = dailyRewardAmounts({
      days: 3,
      initialPoint: 5,
      multiplier: 5,
    });

    assert.deepStrictEqual(amounts, [5, 5, 5]);
  });

  it("single day with initialPoint 10", () => {
    const amounts = dailyRewardAmounts({
      days: 1,
      initialPoint: 10,
      multiplier: 0,
    });

    assert.deepStrictEqual(amounts, [10]);
  });
});
