import AppErrorClass from "./utils/formatter/AppError";
import AppResponseClass from "./utils/formatter/AppResponse";
import User from "./models/User";

declare global {
  // Make AppError available globally
  // eslint-disable-next-line no-var
  var AppError: typeof AppErrorClass;
  // Or as an interface for TypeScript type checking
  type AppError = import("./utils/formatter/AppError").default;

  // Make AppResponse available globally
  // eslint-disable-next-line no-var
  var AppResponse: typeof AppResponseClass;
  // Or as an interface for TypeScript type checking
  type AppResponse<T = unknown> =
    import("./utils/formatter/AppResponse").default<T>;

  // Extend Express Request to include user field
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
