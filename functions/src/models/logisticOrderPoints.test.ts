import assert from "node:assert";
import { describe, it } from "node:test";
import AppSetting from "./AppSetting";
import LogisticItem, { LogisticItemType, LogisticItemUnit } from "./LogisticItem";
import { resolveOrderPoint } from "./logisticOrderPoints";

describe("LogisticItem.calculatePoint", () => {
  const setting = new AppSetting({
    point: { organic: 3, "non-organic": 5, b3: 8 },
  });

  it("uses waste type and ignores piece count", () => {
    const fiveBottles = new LogisticItem({
      type: LogisticItemType.NON_ORGANIC,
      unit: LogisticItemUnit.PCS,
      weight: 5,
    });
    const eightBottles = new LogisticItem({
      type: LogisticItemType.NON_ORGANIC,
      unit: LogisticItemUnit.PCS,
      weight: 8,
    });

    assert.strictEqual(fiveBottles.calculatePoint(setting), 5);
    assert.strictEqual(eightBottles.calculatePoint(setting), 5);
  });

  it("uses organic and b3 rates", () => {
    assert.strictEqual(
      new LogisticItem({ type: LogisticItemType.ORGANIC }).calculatePoint(
        setting,
      ),
      3,
    );
    assert.strictEqual(
      new LogisticItem({ type: LogisticItemType.B3 }).calculatePoint(setting),
      8,
    );
  });
});

describe("resolveOrderPoint", () => {
  const setting = new AppSetting({
    point: { organic: 3, "non-organic": 5, b3: 8 },
  });

  it("uses custom total including zero", () => {
    const items = [
      new LogisticItem({
        id: "item-1",
        type: LogisticItemType.NON_ORGANIC,
      }),
    ];

    assert.strictEqual(resolveOrderPoint(items, setting, 0), 0);
    assert.strictEqual(resolveOrderPoint(items, setting, 12), 12);
  });

  it("sums matching custom item points", () => {
    const items = [
      new LogisticItem({ id: "item-1", type: LogisticItemType.ORGANIC }),
      new LogisticItem({ id: "item-2", type: LogisticItemType.B3 }),
    ];

    const total = resolveOrderPoint(items, setting, undefined, [
      { id: "item-1", point: 4 },
      { id: "item-2", point: 9 },
    ]);

    assert.strictEqual(total, 13);
    assert.strictEqual(items[0].point, 4);
    assert.strictEqual(items[1].point, 9);
  });

  it("falls back to type rates when admin leaves points blank", () => {
    const items = [
      new LogisticItem({ type: LogisticItemType.ORGANIC }),
      new LogisticItem({ type: LogisticItemType.NON_ORGANIC }),
    ];

    assert.strictEqual(resolveOrderPoint(items, setting), 8);
  });
});
