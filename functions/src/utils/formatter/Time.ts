import { TOptions } from "i18next";
import i18n from "../../i18n";

class AppError extends Error {
  httpStatus: number;
  code: string;
  reasons?: string[];
  translationOptions?: TOptions; // Optional translation parameters

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
  }

  translate(locale?: string): this {
    const originalLocale = i18n.language;
    if (locale) {
      i18n.changeLanguage(locale);
    }

    let translated = i18n.t("errors." + this.message, this.translationOptions);
    if (translated === "errors." + this.message) {
      translated = this.message;
    }
    this.message = translated;

    if (this.reasons) {
      this.reasons = this.reasons.map((reason) => {
        let translated = i18n.t("errors." + reason, this.translationOptions);
        if (translated === "errors." + reason) {
          translated = reason;
        }

        return translated;
      });
    }

    if (locale) {
      i18n.changeLanguage(originalLocale);
    }
    return this;
  }

  errFromZode(error: any) {
    this.reasons = error.errors.map((e: { message: string }) => e.message);
    return this;
  }
}

export default AppError;
