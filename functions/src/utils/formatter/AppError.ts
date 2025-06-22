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

    const [ns, code] = this.code.split(".");
    const fullCodeName = ".errors." + code;

    let translated = i18n.t(fullCodeName, { ns, ...this.translationOptions });
    if (translated === fullCodeName) {
      translated = this.message;
    }
    this.message = translated;

    if (this.reasons) {
      this.reasons = this.reasons.map((reason) => {
        const [ns, code] = reason.split(".");
        const fullCodeName = ".errors." + code;

        let translated = i18n.t(fullCodeName, {
          ns,
          ...this.translationOptions,
        });
        if (translated === fullCodeName) {
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

  errFromZode(err: any) {
    console.log(err);
    this.reasons = err.errors.map((e: { message: string }) => e.message);
    return this;
  }
}

export default AppError;
