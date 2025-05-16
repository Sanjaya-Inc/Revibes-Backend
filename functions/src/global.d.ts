import AppErrorClass from "./utils/formatter/AppError";
import AppResponseClass from "./utils/formatter/AppResponse";

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
  type AppResponse<T = any> = import("./utils/formatter/AppResponse").default<T>;
}