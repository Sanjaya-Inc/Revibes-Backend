// src/index.ts (or .js)
import * as dotenv from "dotenv";

const result = dotenv.config({ debug: true }); // <--- Add debug: true here

if (result.error) {
  console.error("dotenv error:", result.error);
} else if (result.parsed) {
  console.log("dotenv variables loaded from .env file.");
} else {
  console.log(
    "dotenv config skipped because variables were already set or .env was missing.",
  );
}

export * from "./handlers";
