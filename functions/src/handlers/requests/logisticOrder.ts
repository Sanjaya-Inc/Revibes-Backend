import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { LogisticOrderController } from "../../controllers/LogisticOrderController";
import {
  LogisticOrderSchema,
  TDeleteLogisticOrder,
  TGetLogisticOrder,
  TSubmitLogisticOrder,
} from "../../dto/logisticOrder";
import {
  AddLogisticItemMediaSchema,
  AddLogisticItemSchema,
  DeleteLogisticItemSchema,
  GetLogisticItemsSchema,
  TAddLogisticItem,
  TAddLogisticItemMedia,
  TDeleteLogisticItem,
  TGetLogisticItems,
} from "../../dto/logisticItem";

export const logisticOrderRoutes = new Routes("logistic-order");

export class LogisticOrderHandlers {
  @registerRoute(logisticOrderRoutes, "post", "", authenticate)
  static async addOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await LogisticOrderController.addOrder(req.user);

    new AppResponse({
      code: 201,
      message: "LOGISTIC_ORDER.ADD_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "get", ":id", authenticate)
  static async getOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    const data: TGetLogisticOrder = { id };

    const response = await LogisticOrderController.getOrder(req.user, data, {
      withItems: true,
    });
    if (!response) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.FETCH_SUCCESS",
      data: response.logisticOrder.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "patch", ":id", authenticate)
  static async submitOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    const data: TSubmitLogisticOrder = { id, ...req.body };

    try {
      // Validate form data using Zod
      LogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.submitOrder(req.user, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.SUBMIT_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "delete", ":id", authenticate)
  static async deleteOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    const data: TDeleteLogisticOrder = { id };

    await LogisticOrderController.deleteOrder(req.user, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.GET_ITEMS_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "post", ":orderId/items", authenticate)
  static async addOrderItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticOrderId = req.params.orderId;
    const data: TAddLogisticItem = { logisticOrderId };

    try {
      // Validate form data using Zod
      AddLogisticItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.addOrderItem(req.user, data);

    new AppResponse({
      code: 201,
      message: "LOGISTIC_ORDER.ADD_ITEM_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "get", ":orderId/items", authenticate)
  static async getOrderItems(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticOrderId = req.params.orderId;
    const data: TGetLogisticItems = {
      logisticOrderId,
    };

    try {
      // Validate form data using Zod
      GetLogisticItemsSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.getOrderItems(
      req.user,
      data,
    );

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.GET_ITEMS_SUCCESS",
      data: response.map((r) => r.pickFields()),
    }).asJsonResponse(res);
  }

  @registerRoute(
    logisticOrderRoutes,
    "delete",
    ":orderId/items/:itemId",
    authenticate,
  )
  static async deleteOrderItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticOrderId = req.params.orderId;
    const logisticOrderItemId = req.params.itemId;
    const data: TDeleteLogisticItem = {
      logisticOrderId,
      logisticOrderItemId,
    };

    try {
      // Validate form data using Zod
      DeleteLogisticItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.deleteOrderItem(req.user, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.DELETE_ITEM_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(
    logisticOrderRoutes,
    "post",
    ":orderId/items/:itemId/media/presigned-url",
    authenticate,
  )
  static async addOrderItemMedia(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticOrderId = req.params.orderId;
    const logisticOrderItemId = req.params.itemId;
    const data: TAddLogisticItemMedia = {
      logisticOrderId,
      logisticOrderItemId,
      ...req.body,
    };

    try {
      // Validate form data using Zod
      AddLogisticItemMediaSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.addOrderItemMedia(
      req.user,
      data,
    );
    new AppResponse({
      code: 201,
      message: "LOGISTIC_ORDER.ADD_ITEM_MEDIA_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
