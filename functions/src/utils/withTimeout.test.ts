import assert from "node:assert";
import { describe, it } from "node:test";
import { withTimeout } from "./withTimeout";

describe("withTimeout", () => {
  it("returns the value when the promise resolves in time", async () => {
    const result = await withTimeout(Promise.resolve("ok"), 50);
    assert.strictEqual(result, "ok");
  });

  it("rejects when the promise hangs past the timeout", async () => {
    await assert.rejects(
      () => withTimeout(new Promise(() => {}), 20),
      (error: Error) => error.message === "FILE_EXISTS_TIMEOUT",
    );
  });
});
