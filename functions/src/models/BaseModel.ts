export class BaseModel {
  toObject(): Record<string, any> {
    // Return all enumerable own properties
    return { ...this };
  }
}

export default BaseModel;
