import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env");

// Only attempt to load if the file exists
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath, debug: true });

  if (result.error) {
    console.error("dotenv error:", result.error);
  } else if (result.parsed) {
    console.log("dotenv variables loaded from .env file.");
  }
} else {
  console.log(
    "No .env file found — relying on existing environment variables (CI/Production).",
  );
}

export * from "./handlers";
