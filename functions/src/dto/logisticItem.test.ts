import assert from "node:assert";
import { describe, it } from "node:test";
import { LogisticItemSchema } from "./logisticItem";
import { LogisticItemUnit } from "../models/LogisticItem";

describe("LogisticItemSchema unit", () => {
  it("defaults unit to kg when omitted", () => {
    const parsed = LogisticItemSchema.parse({
      name: "Leaves",
      type: "organic",
      weight: 1,
    });
    assert.strictEqual(parsed.unit, LogisticItemUnit.KG);
  });

  it("accepts pcs", () => {
    const parsed = LogisticItemSchema.parse({
      name: "Bottles",
      type: "non-organic",
      weight: 5,
      unit: "pcs",
    });
    assert.strictEqual(parsed.unit, LogisticItemUnit.PCS);
  });

  it("rejects an unknown unit", () => {
    assert.throws(() =>
      LogisticItemSchema.parse({
        name: "Leaves",
        type: "organic",
        weight: 1,
        unit: "lb",
      }),
    );
  });
});
