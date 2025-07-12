import { Timestamp } from "firebase-admin/firestore";

export class BaseModel {
  constructor(
    input: Partial<Record<string, any>> = {},
    defaultValues: Partial<Record<string, any>> = {},
  ) {
    // Call the conversion method, passing the input data
    this.parseInput(input, defaultValues);
  }

  parseInput(
    input: Partial<Record<string, any>>,
    defaultValues: Partial<Record<string, any>>,
  ): void {
    for (const key in defaultValues) {
      const value = input[key];
      const defaultValue = defaultValues[key];
      if (value instanceof Timestamp) {
        // Convert Timestamp to Date and assign directly to the instance
        (this as any)[key] = value.toDate();
      } else {
        // Assign other properties as they are, or apply further logic
        (this as any)[key] = value ?? defaultValue;
      }
    }
  }

  toObject(): Record<string, any> {
    // Return all enumerable own properties except those with undefined values
    return Object.fromEntries(
      Object.entries(this).filter(([, v]) => v !== undefined),
    );
  }

  pickFields<K extends keyof this>(keys?: K[]): Pick<this, K> {
    const allKeys = keys ?? (Object.keys(this) as K[]);
    const result = {} as Pick<this, K>;
    for (const key of allKeys) {
      result[key] = this[key];
      if (this[key] instanceof Timestamp) {
        result[key] = this[key].toDate() as any;
      } else {
        result[key] = this[key];
      }
    }
    return result;
  }
}

export default BaseModel;
