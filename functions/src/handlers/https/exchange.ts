import {
  CreateExchangeTransactionSchema,
  GetExchangeTransactionSchema,
  TCreateExchangeTransaction,
  TGetExchangeTransaction,
} from "./../../dto/exchangeTransaction";
import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { parseFormData } from "../../utils/formatter/formData";
import { PaginationSchema, TPagination } from "../../dto/pagination";
import {
  AddExchangeItemSchema,
  DeleteExchangeItemSchema,
  GetExchangeItemSchema,
  GetExchangeItemsSchema,
  TAddExchangeItem,
  TDeleteExchangeItem,
  TGetExchangeItem,
  TGetExchangeItems,
} from "../../dto/exchangeItem";
import { ExchangeItemController } from "../../controllers/ExchangeItemController";
import { ExchangeTransactionController } from "../../controllers/ExchangeTransactionController";

export const exchangeRoutes = new Routes("exchanges");

export class ExchangeHandlers {
  @registerRoute(exchangeRoutes, "get", "transactions", authenticate)
  static async getTransactions(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let filters: TPagination;

    try {
      // Validate form data using Zod
      filters = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeTransactionController.getTransactions(
      req.user,
      filters,
      { withItems: true },
    );
    new AppResponse({
      code: 200,
      message: "EXCHANGE.TRANSACTION_FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(exchangeRoutes, "get", "transactions/:id", authenticate)
  static async getTransaction(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetExchangeTransaction = { id };

    try {
      // Validate form data using Zod
      data = GetExchangeTransactionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeTransactionController.getTransaction(
      req.user,
      data,
      { withItems: true },
    );
    if (!response) {
      throw new AppError(404, "EXCHANGE.ITEM_NOT_FOUND");
    }

    new AppResponse({
      code: 200,
      message: "EXCHANGE.TRANSACTION_FETCH_SUCCESS",
      data: response.data.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(exchangeRoutes, "post", "transactions", authenticate)
  static async createTransaction(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let data: TCreateExchangeTransaction = req.body;

    try {
      // Validate form data using Zod
      data = CreateExchangeTransactionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeTransactionController.createTransaction(
      req.user,
      data,
    );
    new AppResponse({
      code: 201,
      message: "EXCHANGE.TRANSACTION_CREATE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(
    exchangeRoutes,
    "post",
    "transactions/estimate-price",
    authenticate,
  )
  static async estimatePrice(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let data: TCreateExchangeTransaction = req.body;

    try {
      // Validate form data using Zod
      data = CreateExchangeTransactionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const { amount, discount, total, requestItems } =
      await ExchangeTransactionController.checkTransaction(req.user, data);

    new AppResponse({
      code: 201,
      message: "EXCHANGE.TRANSACTION_CHECK_SUCCESS",
      data: { amount, discount, total, items: requestItems },
    }).asJsonResponse(res);
  }

  @registerRoute(exchangeRoutes, "get", "", authenticate)
  static async getPurchaseableItems(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let filters: TGetExchangeItems;
    try {
      filters = GetExchangeItemsSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeItemController.getPurchaseableItems(
      req.user,
      filters,
      {withMetadata: true},
    );
    response.items = response.items.map((i) => i.getPublicFields());

    new AppResponse({
      code: 200,
      message: "EXCHANGE.FETCH_ITEMS_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(exchangeRoutes, "get", ":id", authenticate)
  static async getPurchaseableItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetExchangeItem = { id };
    try {
      // Validate form data using Zod
      data = GetExchangeItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeItemController.getPurchaseableItem(
      req.user,
      data,
      {withMetadata: true},
    );
    if (!response) {
      throw new AppError(404, "EXCHANGE.ITEM_NOT_FOUND");
    }

    new AppResponse({
      code: 200,
      message: "EXCHANGE.FETCH_ITEM_SUCCESS",
      data: response.data.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(exchangeRoutes, "post", "", authenticate, adminOnly)
  static async addPurchaseableItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let data = parseFormData<TAddExchangeItem>(req);

    try {
      // Validate form data using Zod
      data = AddExchangeItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeItemController.addPurchaseableItem(
      req.user,
      data,
    );
    new AppResponse({
      code: 201,
      message: "EXCHANGE.ADD_ITEM_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(exchangeRoutes, "delete", ":id", authenticate, adminOnly)
  static async deletePurchaseableItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TDeleteExchangeItem = { id };

    try {
      // Validate form data using Zod
      data = DeleteExchangeItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await ExchangeItemController.deletePurchaseableItem(
      req.user,
      data,
    );
    new AppResponse({
      code: 200,
      message: "EXCHANGE.DELETE_ITEM_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
