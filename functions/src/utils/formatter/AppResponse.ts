import i18next, {TOptions} from "i18next";
import AppError from "./AppError";
import {Response} from "express";
import {t} from "../i18n";

export type TAppResponseConstructor<T> = {
  code: number;
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
    const val = {...this.value};
    const {code, err} = val;

    if (err) {
      const translatedError = err.translate(res.req.query.locale as string); // Assuming locale is passed in the query
      val.err = translatedError;
      val.error = err.message;
      delete val.message; // Don't send the original message if there's a translated error
    } else if (val.translationKey) {
      val.message = t(val.translationKey, {
        ...val.translationOptions,
        lng: res.req.query.locale as string,
      });
    }

    res.status(code ?? 200).json(val);
  }

  translate(locale?: string, options?: TOptions): this {
    const originalLocale = i18next.language;
    if (locale) {
      i18next.changeLanguage(locale);
    }

    if (this.value.translationKey) {
      this.value.message = t(this.value.translationKey, options);
    } else if (this.value.message) {
      this.value.message = t(this.value.message, options);
    }

    if (this.value.err) {
      this.value.err.translate(locale);
    }

    if (locale) {
      i18next.changeLanguage(originalLocale);
    }
    return this; // Allow chaining
  }
}

export default AppResponse;
