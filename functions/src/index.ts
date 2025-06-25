// src/index.ts (or .js)
import * as dotenv from "dotenv";

const result = dotenv.config({ debug: true }); // <--- Add debug: true here

if (result.error) {
  console.error("dotenv error:", result.error);
} else if (result.parsed) {
  console.log("dotenv parsed:", result.parsed);
} else {
  console.log(
    "dotenv config called, but no parsed variables (perhaps already loaded or file not found).",
  );
}

export * from "./handlers";
