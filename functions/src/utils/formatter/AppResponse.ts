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
  translationKey?: string; // Optional key for top-level message translation
  translationOptions?: TOptions; // Optional options for top-level message translation
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
      code = err.httpStatus;
      val.code = code;
      val.error = err.message;
      val.reasons = err.reasons;
      delete val.message;
      delete val.err;
    } else if (val.message) {
      // const parts = val.message.split(".");
      // if (parts.length === 2) {
      //   const [ns, code] = parts;
      //   val.message = i18n.t(ns + ".messages." + code, {
      //     ns,
      //     ...val.translationOptions,
      //     lng: (res.req.query.locale as string) || "en",
      //   });
      // }
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
    return this; // Allow chaining
  }
}

export default AppResponse;
