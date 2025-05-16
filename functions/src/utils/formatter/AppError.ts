// error file
import i18next, {TOptions} from "i18next";
import {t} from "../i18n";

class AppError extends Error {
  code: string;
  reasons?: string[];
  translationOptions?: TOptions; // Optional translation parameters

  constructor(
    code: string,
    reasons?: string[],
    translationOptions?: TOptions,
  ) {
    super(code);
    this.name = "AppError";
    this.code = code;
    this.reasons = reasons;
    this.translationOptions = translationOptions;
  }

  translate(locale?: string): this {
    const originalLocale = i18next.language;
    if (locale) {
      i18next.changeLanguage(locale);
    }

    this.message = t("errors/" + this.message, this.translationOptions);

    if (this.reasons) {
      this.reasons = this.reasons.map((reason) =>
        t("errors/" + reason, this.translationOptions),
      );
    }

    if (locale) {
      i18next.changeLanguage(originalLocale);
    }
    return this; // Allow chaining
  }
}

export default AppError;
