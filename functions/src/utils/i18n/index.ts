// functions/src/utils/i18n.ts
import i18next from "i18next";
import en from "../locales/en.json";

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

export const t = (key: string, options?: i18next.TOptions): string => {
  return i18next.t(key, options);
};

export const setLocale = (lng = "en") => {
  i18next.changeLanguage(lng);
};
