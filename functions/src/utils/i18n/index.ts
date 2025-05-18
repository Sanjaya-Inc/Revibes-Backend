// functions/src/utils/i18n.ts
import i18next, { TOptions } from "i18next";
import en from "./en/translation.json";

i18next.init({
  lng: "en", // Default language
  fallbackLng: "en",
  resources: {
    en: {
      translation: en,
    },
    // Add more languages here
  },
});

export const t = (key: string, options?: TOptions): string => {
  return i18next.t(key, options);
};

export const setLocale = (lng = "en") => {
  i18next.changeLanguage(lng);
};
