import assert from "node:assert";
import { describe, it } from "node:test";
import { UpdateAppSettingSchema } from "./appSetting";
import { defaultAppSettingData } from "../models/AppSetting";

describe("AppSetting bannerText", () => {
  it("default app setting includes default bannerText", () => {
    const dailyReward = defaultAppSettingData.dailyReward;
    assert.strictEqual(
      dailyReward?.bannerText,
      "Check in 30 Days & Get Voucher Rp25k",
    );
  });

  it("parses valid bannerText in dailyReward schema", () => {
    const input = {
      point: { organic: 5, "non-organic": 5, b3: 5 },
      dailyReward: {
        days: 7,
        initialPoint: 1,
        multiplier: 0,
        bannerText: "Custom banner text for check-in",
      },
    };

    const parsed = UpdateAppSettingSchema.parse(input);
    assert.strictEqual(
      parsed.dailyReward?.bannerText,
      "Custom banner text for check-in",
    );
  });
});
