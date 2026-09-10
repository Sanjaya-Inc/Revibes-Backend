import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import admin from "firebase-admin";
import FileStorage from "./fileStorage";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "revibes-d77f0",
    storageBucket: "revibes-d77f0.firebasestorage.app",
  });
}

describe("FileStorage URL generation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.STORAGE_EMULATOR_HOST;
    delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    delete process.env.FUNCTIONS_EMULATOR;
    process.env.ENV = "local";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("builds an object media URL without calling Storage", () => {
    const storage = new FileStorage();
    assert.strictEqual(
      storage.objectMediaUrl("logistics/order-1/items/file-1"),
      "https://storage.googleapis.com/revibes-d77f0.firebasestorage.app/logistics%2Forder-1%2Fitems%2Ffile-1?alt=media",
    );
  });

  it("returns cloud firebase storage URL when not running in emulator even if ENV is local", async () => {
    const storage = new FileStorage();
    const url = await storage.getFullUrl("banners/test-id");
    assert.strictEqual(
      url,
      "https://storage.googleapis.com/revibes-d77f0.firebasestorage.app/banners%2Ftest-id?alt=media",
    );
  });

  it("returns emulator URL when STORAGE_EMULATOR_HOST is set", async () => {
    // Arrange
    process.env.STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
    const storage = new FileStorage();
    // Act
    const url = await storage.getFullUrl("banners/test-id");
    // Assert
    assert.strictEqual(
      url,
      "http://127.0.0.1:9199/revibes-d77f0.firebasestorage.app/banners%2Ftest-id?alt=media",
    );
  });

  it("returns emulator URL when FUNCTIONS_EMULATOR is true and ENV is local", async () => {
    // Arrange
    process.env.FUNCTIONS_EMULATOR = "true";
    process.env.ENV = "local";
    const storage = new FileStorage();
    // Act
    const url = await storage.getFullUrl("banners/test-id");
    // Assert
    assert.strictEqual(
      url,
      "http://localhost:9199/revibes-d77f0.firebasestorage.app/banners%2Ftest-id?alt=media",
    );
  });
});
