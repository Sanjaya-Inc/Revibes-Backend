import i18next, {TOptions} from "i18next";
import AppError from "./AppError";
import {Response} from 'express';
import {t} from "../i18n";

export type TAppResponseConstructor<T> = {
  code: number;
  status?: "success" | "failed";
  message?: string;
  data?: T;
  errorObj?: AppError;
  error?: string;
  reasons?: string[];
  translationKey?: string; // Optional key for top-level message translation
  translationOptions?: TOptions; // Optional options for top-level message translation
};

class AppResponse<T> {
  value: TAppResponseConstructor<T>;

  constructor(value: TAppResponseConstructor<T>) {
    this.value = value;
  }

  asJsonResponse(res: Response) {
    const val = {...this.value};
    const {code, errorObj} = val;

    if (errorObj) {
      const translatedError = errorObj.translate(res.req.query.locale as string); // Assuming locale is passed in the query
      val.errorObj = translatedError;
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

    if (this.value.error) {
      this.value.error.translate(locale);
    }

    if (locale) {
      i18next.changeLanguage(originalLocale);
    }
    return this; // Allow chaining
  }
}

export default AppResponse;
