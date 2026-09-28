import assert from "node:assert";
import { describe, it } from "node:test";
import UserDailyReward from "../models/UserDailyReward";

describe("UserDailyReward setting-driven amount", () => {
  it("stored amount is overridden by configured amount", () => {
    const reward = new UserDailyReward({
      id: "legacy-1",
      index: 2,
      amount: 2,
      createdAt: new Date(),
      claimedAt: null,
    });

    reward.applySettingAmount(5);

    assert.strictEqual(reward.amount, 5);
  });

  it("claimed history keeps stored amount", () => {
    const claimedAt = new Date("2026-01-01");
    const reward = new UserDailyReward({
      id: "claimed-1",
      index: 1,
      amount: 2,
      createdAt: new Date(),
      claimedAt,
    });

    reward.applySettingAmount(5);

    assert.strictEqual(reward.amount, 2);
  });
});
