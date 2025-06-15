import { Timestamp } from "firebase-admin/firestore";

export class BaseModel {
  constructor(input: Partial<Record<string, any>> = {}) {
    this.setDate("createdAt", input);
    this.setDate("updatedAt", input);
  }

  setDate(key: string, input: any) {
    // If createdAt is a property of the child and not already set, assign it
    if (key in this && input[key] === undefined) {
      (this as any)[key] = new Date();
    } else if (input[key] instanceof Timestamp) {
      (this as any)[key] = input[key].toDate();
    } else {
      (this as any)[key] = input[key];
    }
  }

  toObject(): Record<string, any> {
    // Return all enumerable own properties
    return { ...this };
  }

  pickFields<K extends keyof this>(keys: K[]): Pick<this, K> {
    const result = {} as Pick<this, K>;
    for (const key of keys) {
      result[key] = this[key];
    }
    return result;
  }
}

export default BaseModel;
