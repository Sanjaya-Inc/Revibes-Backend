export class PhoneNumberUtil {
  public static normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith("0")) {
      return "+62" + phoneNumber.slice(1);
    } else if (phoneNumber.startsWith("62")) {
      return "+" + phoneNumber;
    } else if (phoneNumber.startsWith("8")) {
      return "+62" + phoneNumber;
    } else if (phoneNumber.startsWith("+62")) {
      return phoneNumber;
    }
    return phoneNumber;
  }

  public static isValidPhoneNumber(phoneNumber: string): boolean {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const phoneRegex = /^\+628[1-9][0-9]{7,10}$/;
    return phoneRegex.test(normalizedPhone);
  }

  public static isPhoneNumber(identifier: string): boolean {
    const phoneRegex = /^(\+62|0|62)?8[1-9][0-9]{7,10}$/;
    return phoneRegex.test(identifier);
  }

  public static isEmail(identifier: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier);
  }
}

export default PhoneNumberUtil;
