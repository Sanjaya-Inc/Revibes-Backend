import User from "./models/User";

declare global {
  // Extend Express Request to include user field
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
