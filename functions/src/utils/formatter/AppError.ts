import i18next, {TOptions} from "i18next";
import {t} from "../i18n";

class AppError extends Error {
  httpStatus: number;
  code: string;
  reasons?: string[];
  translationOptions?: TOptions; // Optional translation parameters

  constructor(httpStatus: number, code: string, reasons?: string[], translationOptions?: TOptions) {
    super(code);
    this.httpStatus = httpStatus;
    this.code = code;
    this.reasons = reasons;
    this.translationOptions = translationOptions;
  }

  translate(locale?: string): this {
    const originalLocale = i18next.language;
    if (locale) {
      i18next.changeLanguage(locale);
    }

    let translated = t("errors." + this.message, this.translationOptions);
    if (translated === "errors." + this.message) {
      translated = this.message;
    }
    this.message = translated;

    if (this.reasons) {
      this.reasons = this.reasons.map((reason) => {
        let translated = t("errors." + reason, this.translationOptions);
        if (translated === "errors." + reason) {
          translated = reason;
        }

        return translated; 
      });
    }

    if (locale) {
      i18next.changeLanguage(originalLocale);
    }
    return this;
  }

  errFromZode(error: any) {
    this.reasons = error.errors.map((e: { message: string }) => e.message);
    return this;
  }
}

export default AppError;
