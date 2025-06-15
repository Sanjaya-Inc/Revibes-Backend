import AppError from "../formatter/AppError"; // Adjust path as needed

/**
 * A method decorator that wraps an asynchronous function with a try-catch block
 * to standardize error handling, converting generic errors into AppError instances.
 *
 * @param target The prototype of the class (for instance methods) or the constructor function (for static methods).
 * @param propertyKey The name of the method.
 * @param descriptor The PropertyDescriptor for the method.
 * @return The modified PropertyDescriptor.
 */
export function wrapError(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  // Store the original method implementation
  const originalMethod = descriptor.value;

  // Redefine the method's value (the function itself)
  descriptor.value = async function (...args: any[]): Promise<any> {
    try {
      // Call the original method using .apply() to maintain the correct 'this' context
      // Await its result because the original method is expected to be async
      const result = await originalMethod.apply(this, args);
      return result;
    } catch (error: any) {
      console.log("error: ", error)
      // Check if the error is already an instance of AppError
      if (error instanceof AppError) {
        throw error; // Re-throw the AppError as is
      } else {
        // For any other generic error, wrap it in a standard AppError
        // This ensures all errors propagated out of wrapped methods are consistent
        throw new AppError(500, "COMMON.INTERNAL_SERVER_ERROR");
      }
    }
  };

  // Return the modified descriptor to apply the changes
  return descriptor;
}
