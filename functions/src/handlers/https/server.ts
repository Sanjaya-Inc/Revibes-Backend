import express, { NextFunction, Request, Response } from "express";
import { settingRoutes } from "./setting";
import { authRoutes } from "./auth";
import { bannerRoutes } from "./banner";
import { countryRoutes } from "./country";
import { userRoutes } from "./user";
import { meRoutes } from "./meUser";
import { storeRoutes } from "./store";
import { logisticOrderRoutes } from "./logisticOrder";
import { voucherRoutes } from "./voucher";

import { errorHandler } from "../../middlewares/error";
import { bodyParser } from "../../middlewares/parser";

const ROUTES = [
  ...settingRoutes.getApis(),
  ...authRoutes.getApis(),
  ...bannerRoutes.getApis(),
  ...countryRoutes.getApis(),
  ...userRoutes.getApis(),
  ...meRoutes.getApis(),
  ...storeRoutes.getApis(),
  ...logisticOrderRoutes.getApis(),
  ...voucherRoutes.getApis(),
];

export const app = express();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.use(bodyParser);

// Install api routes
for (const [method, path, ...handlers] of ROUTES) {
  app[method](path, ...handlers.map((h) => asyncHandler(h)));
}

app.use(errorHandler);

export default app;
