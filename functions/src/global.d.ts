import User from "./models/User";

declare global {
  // Extend Express Request to include user field
  namespace Express {
    interface Request {
      user?: User;
    }
  }

  // Add global env definition
  namespace NodeJS {
    interface ProcessEnv {
      REGION: string;
      JWT_SECRET: string;
      ADMIN_ROOT_MAIL: string;
      ADMIN_ROOT_PASS: string;
    }
  }
}
