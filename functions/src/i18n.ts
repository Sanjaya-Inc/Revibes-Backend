import i18n from "i18next";
import Backend from "i18next-http-backend";
import path from "path";

i18n.use(Backend).init({
  lng: "en", // default language
  fallbackLng: "en",
  debug: false,
  ns: [
    "AUTH",
    "BANNER",
    "COMMON",
    "COUNTRY",
    "FILE",
    "ITEM",
    "LOGISTIC",
    "STORE",
    "USER",
  ],
  defaultNS: "COMMON",
  backend: {
    loadPath: path.resolve(__dirname, "./locales/{{lng}}/{{ns}}.json"),
  },
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false, // important for synchronous use in Cloud Functions
});

export default i18n;
