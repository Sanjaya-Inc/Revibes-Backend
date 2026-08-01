import { TOptions } from "i18next";
import i18n from "../../i18n";

export function humanizeKey(key: string): string {
  if (!key) return "";

  const rawCode = key.includes(".") ? key.split(".").pop() || key : key;

  const dictionary: Record<string, string> = {
    BAD_REQUEST: "Bad request",
    FORBIDDEN: "Request is forbidden",
    METHOD_NOT_ALLOWED: "Request method is not allowed",
    INTERNAL_SERVER_ERROR: "Internal server error",
    FCM_TOKEN_REQUIRED: "FCM token is required",
    DEVICE_TOKEN_REQUIRED: "Device token is required",
    USER_AGENT_REQUIRED: "User agent is required",
    ID_REQUIRED: "ID is required",
  };

  if (dictionary[rawCode]) {
    return dictionary[rawCode];
  }

  const words = rawCode
    .split(/[._]/)
    .filter((w) => w.length > 0)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx === 0) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return lower;
    });

  const sentence = words.join(" ");
  return sentence.length > 0 ? sentence : key;
}

export function translateSingleKey(key: string, options?: TOptions): string {
  if (!key) return "";

  const parts = key.split(".");
  const ns = parts.length > 1 ? parts[0] : undefined;
  const code = parts.length > 1 ? parts[1] : parts[0];

  const candidateKeys = [
    code,
    `errors.${code}`,
    `ERRORS.${code}`,
    `messages.${code}`,
  ];

  for (const candidate of candidateKeys) {
    const opts = ns ? { ns, ...options } : { ...options };
    const translated = i18n.t(candidate, opts);
    if (translated && translated !== candidate && !translated.startsWith(".")) {
      return translated;
    }
  }

  return humanizeKey(key);
}

class AppError extends Error {
  httpStatus: number;
  code: string;
  reasons?: string[];
  translationOptions?: TOptions;

  constructor(
    httpStatus: number,
    code: string,
    reasons?: string[],
    translationOptions?: TOptions,
  ) {
    super(code);
    this.httpStatus = httpStatus;
    this.code = code;
    this.reasons = reasons;
    this.translationOptions = translationOptions;
    this.translate();
  }

  translate(locale?: string): this {
    const originalLocale = i18n.language;
    if (locale) {
      i18n.changeLanguage(locale);
    }

    if (this.reasons && this.reasons.length > 0) {
      this.reasons = this.reasons.map((r) =>
        translateSingleKey(r, this.translationOptions),
      );
    }

    let mainMessage = translateSingleKey(this.code, this.translationOptions);

    if (
      (this.code.includes("BAD_REQUEST") ||
        mainMessage === "Bad request" ||
        mainMessage === this.code) &&
      this.reasons &&
      this.reasons.length > 0
    ) {
      mainMessage = this.reasons[0];
    }

    this.message = mainMessage;

    if (locale) {
      i18n.changeLanguage(originalLocale);
    }
    return this;
  }

  errFromZode(err: any) {
    if (err && Array.isArray(err.errors)) {
      this.reasons = err.errors.map((e: { message: string }) => e.message);
      this.translate();
    }
    return this;
  }
}

export default AppError;
