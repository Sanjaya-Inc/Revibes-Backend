import { TOptions } from "i18next";
import AppError from "./AppError";
import { Response } from "express";
import i18n from "../../i18n";

export type TAppResponseConstructor<T> = {
  code?: number;
  status?: "success" | "failed";
  message?: string;
  data?: T;
  err?: AppError;
  error?: string;
  reasons?: string[];
  translationKey?: string;
  translationOptions?: TOptions;
};

class AppResponse<T> {
  value: TAppResponseConstructor<T>;

  constructor(value: TAppResponseConstructor<T>) {
    this.value = value;
    if (value.err) {
      this.value.status = "failed";
    } else {
      this.value.status = "success";
    }
  }

  asJsonResponse(res: Response) {
    const val = { ...this.value };
    const { err } = val;
    let { code } = val;

    if (err) {
      if (res?.req?.query?.locale) {
        err.translate(res.req.query.locale as string);
      }
      code = err.httpStatus;
      val.code = code;
      val.error = err.code;
      val.message = err.message;
      val.reasons = err.reasons;
      delete val.err;
    }

    res.status(code ?? 200).json(val);
  }

  translate(locale?: string, options?: TOptions): this {
    const originalLocale = i18n.language;
    if (locale) {
      i18n.changeLanguage(locale);
    }

    if (this.value.translationKey) {
      const [ns, code] = this.value.translationKey.split(".");
      this.value.message = i18n.t(code, { ns, ...options });
    } else if (this.value.message) {
      const [ns, code] = this.value.message.split(".");
      this.value.message = i18n.t(code, { ns, ...options });
    }

    if (locale) {
      i18n.changeLanguage(originalLocale);
    }
    return this;
  }
}

export default AppResponse;
