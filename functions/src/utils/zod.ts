export function dropUndefinedFromObject<T>(data: T): T {
  const cleanedData: { [key: string]: any } = {}; // Use index signature for dynamic keys
  for (const key in data) {
    // Check if the property belongs to the object itself, not its prototype chain
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Keep property if its value is not undefined
      if (data[key as keyof typeof data] !== undefined) {
        cleanedData[key] = data[key as keyof typeof data];
      }
    }
  }
  return cleanedData as T;
}
