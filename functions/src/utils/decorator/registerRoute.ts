import { RequestHandler } from "express";
import Routes, { method } from "../../handlers/requests/route";

/**
 * A method decorator that wraps an asynchronous function with a try-catch block
 * to standardize error handling, converting generic errors into AppError instances.
 *
 * @param target The prototype of the class (for instance methods) or the constructor function (for static methods).
 * @param propertyKey The name of the method.
 * @param descriptor The PropertyDescriptor for the method.
 * @return The modified PropertyDescriptor.
 */
export function registerRoute(
  baseRoutes: Routes,
  method: method,
  path = "",
  ...middlewares: RequestHandler[]
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const handler = descriptor.value;
    baseRoutes.registerApi(method, path, ...middlewares, handler);
  };
}
