import i18n from "i18next";
import Backend from "i18next-http-backend";
import path from "path";

i18n.use(Backend).init({
  lng: "en",
  fallbackLng: "en",
  debug: false,
  ns: [
    "AUTH",
    "BANNER",
    "COMMON",
    "COUNTRY",
    "EXCHANGE",
    "FILE",
    "INVENTORY",
    "ITEM",
    "LOGISTIC",
    "LOGISTIC_ORDER",
    "MISSION",
    "NEWS",
    "POSITION",
    "STORE",
    "USER",
    "USER_DEVICE",
    "VOUCHER",
  ],
  defaultNS: "COMMON",
  backend: {
    loadPath: path.resolve(__dirname, "./locales/{{lng}}/{{ns}}.json"),
  },
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

export default i18n;
