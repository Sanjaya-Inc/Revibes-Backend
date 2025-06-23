import { Timestamp } from "firebase-admin/firestore";

export class BaseModel {
  constructor(input: Partial<Record<string, any>> = {}) {
    this.setDate("createdAt", input);
    this.setDate("updatedAt", input);
  }

  setDate(key: string, input: any) {
    // If createdAt is a property of the child and not already set, assign it
    if (input[key] instanceof Timestamp) {
      (this as any)[key] = input[key].toDate();
    } else {
      (this as any)[key] = input[key] === undefined ? new Date() : input[key];
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
