import { TGetUserRes } from "./dto/user";

declare global {
  // Extend Express Request to include user field
  namespace Express {
    interface Request {
      user?: TGetUserRes;
    }
  }

  // Add global env definition
  namespace NodeJS {
    interface ProcessEnv {
      ENV: "production" | "development";
      REGION: string;
      JWT_SECRET: string;
      ADMIN_ROOT_MAIL: string;
      ADMIN_ROOT_PASS: string;
    }
  }
}
