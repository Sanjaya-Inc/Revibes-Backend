import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import {
  TDeleteBanner,
} from "../../dto/banner";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { parseFormData } from "../../utils/formatter/formData";
import { AddInventoryItemSchema, DeleteInventoryItemSchema, GetInventoryItemSchema, TAddInventoryItem, TGetInventoryItem } from "../../dto/inventoryItem";
import { InventoryItemController } from "../../controllers/InventoryItemController";
import { PaginationSchema, TPagination } from "../../dto/pagination";

export const inventoryRoutes = new Routes("inventories");

export class IventoryHandlers {
  @registerRoute(inventoryRoutes, "get", "items", authenticate)
  static async getItems(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let filters: TPagination;
    try {
      filters = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await InventoryItemController.getItems(req.user, filters);

    response.items = response.items.map((i) => i.getPublicFields());

    new AppResponse({
      code: 200,
      message: "INVENTORY.FETCH_ITEMS_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(inventoryRoutes, "get", "items/:id", authenticate)
  static async getItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetInventoryItem = { id };
    try {
      // Validate form data using Zod
      data = GetInventoryItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await InventoryItemController.getItem(req.user, data);
    if (!response) {
      throw new AppError(404, "INVENTORY.ITEM_NOT_FOUND");
    }

    new AppResponse({
      code: 200,
      message: "INVENTORY.FETCH_ITEM_SUCCESS",
      data: response.data.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(inventoryRoutes, "post", "items", authenticate, adminOnly)
  static async addItem(req: Request, res: Response) {
    let data = parseFormData<TAddInventoryItem>(req);

    try {
      // Validate form data using Zod
      data = AddInventoryItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await InventoryItemController.addItem(data);
    new AppResponse({
      code: 201,
      message: "INVENTORY.ADD_ITEM_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(inventoryRoutes, "delete", "items/:id", authenticate, adminOnly)
  static async deleteItem(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TDeleteBanner = { id };

    try {
      // Validate form data using Zod
      data = DeleteInventoryItemSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await InventoryItemController.deleteItem(req.user, data);
    new AppResponse({
      code: 200,
      message: "INVENTORY.DELETE_ITEM_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
