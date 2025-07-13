import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { LogisticOrderController } from "../../controllers/LogisticOrderController";
import {
  CompleteLogisticOrderSchema,
  DeleteLogisticOrderSchema,
  EstimateLogisticOrderPointSchema,
  GetLogisticOrderSchema,
  LogisticOrderSchema,
  RejectLogisticOrderSchema,
  TCompleteLogisticOrder,
  TDeleteLogisticOrder,
  TEstimateLogisticOrderPoint,
  TGetLogisticOrder,
  TRejectLogisticOrder,
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
import { PaginationSchema, TPagination } from "../../dto/pagination";
import { getFileStorageInstance } from "../../utils/firebase";

export const logisticOrderRoutes = new Routes("logistic-orders");

export class LogisticOrderHandlers {
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
    let data: TAddLogisticItemMedia = {
      logisticOrderId,
      logisticOrderItemId,
      ...req.body,
    };

    try {
      // Validate form data using Zod
      data = AddLogisticItemMediaSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.addOrderItemMedia(
      req.user.data,
      data,
    );
    new AppResponse({
      code: 201,
      message: "LOGISTIC_ORDER.ADD_ITEM_MEDIA_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "post", ":orderId/items", authenticate)
  static async addOrderItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticOrderId = req.params.orderId;
    let data: TAddLogisticItem = { logisticOrderId };

    try {
      // Validate form data using Zod
      data = AddLogisticItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.addOrderItem(
      req.user.data,
      data,
    );

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
    let data: TGetLogisticItems = {
      logisticOrderId,
    };

    try {
      // Validate form data using Zod
      data = GetLogisticItemsSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.getOrderItems(
      req.user.data,
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
    let data: TDeleteLogisticItem = {
      logisticOrderId,
      logisticOrderItemId,
    };

    try {
      // Validate form data using Zod
      data = DeleteLogisticItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.deleteOrderItem(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.DELETE_ITEM_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(
    logisticOrderRoutes,
    "post",
    ":id/estimate-point",
    authenticate,
  )
  static async estimateOrderPoint(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let data: TEstimateLogisticOrderPoint = req.body;

    try {
      // Validate form data using Zod
      data = EstimateLogisticOrderPointSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.estimateOrderPoint(data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.ESTIMATE_POINT_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "put", ":id/save", authenticate)
  static async saveOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TSubmitLogisticOrder = { id, ...req.body };

    try {
      // Validate form data using Zod
      data = LogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.saveOrder(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.SAVE_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "patch", ":id/submit", authenticate)
  static async submitOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TSubmitLogisticOrder = { id, ...req.body };

    try {
      // Validate form data using Zod
      data = LogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.submitOrder(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.SUBMIT_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(
    logisticOrderRoutes,
    "patch",
    ":id/reject",
    authenticate,
    adminOnly,
  )
  static async rejectOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TRejectLogisticOrder = { id, ...req.body };

    try {
      // Validate form data using Zod
      data = RejectLogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.rejectOrder(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.REJECT_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(
    logisticOrderRoutes,
    "patch",
    ":id/complete",
    authenticate,
    adminOnly,
  )
  static async completeOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TCompleteLogisticOrder = { id, ...req.body };

    try {
      // Validate form data using Zod
      data = CompleteLogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.completeOrder(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.COMPLETE_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "get", ":id", authenticate)
  static async getOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetLogisticOrder = { id };
    try {
      // Validate form data using Zod
      data = GetLogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.getOrder(
      req.user.data,
      data,
      {
        withItems: true,
        withHistories: true,
      },
    );
    if (!response) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    await response.data.retrieveFullUrl(getFileStorageInstance());

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.FETCH_SUCCESS",
      data: response.data.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "delete", ":id", authenticate)
  static async deleteOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TDeleteLogisticOrder = { id };
    try {
      // Validate form data using Zod
      data = DeleteLogisticOrderSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await LogisticOrderController.deleteOrder(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.GET_ITEMS_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "post", "", authenticate)
  static async addOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await LogisticOrderController.addOrder(req.user.data);

    new AppResponse({
      code: 201,
      message: "LOGISTIC_ORDER.ADD_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(logisticOrderRoutes, "get", "", authenticate)
  static async getOrders(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let pagination: TPagination;
    try {
      pagination = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await LogisticOrderController.getOrders(
      req.user.data,
      pagination,
    );
    new AppResponse({
      code: 200,
      message: "LOGISTIC_ORDER.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
