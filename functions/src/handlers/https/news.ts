import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import { NewsController } from "../../controllers/NewsController";
import {
  CreateNewsSchema,
  TCreateNews,
  UpdateNewsSchema,
  TUpdateNews,
} from "../../dto/news";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";

export const newsRoutes = new Routes("news");

export class NewsHandlers {
  @registerRoute(newsRoutes, "get", "", authenticate)
  static async getNews(req: Request, res: Response) {
    const response = await NewsController.getDailyNews();
    new AppResponse({
      code: 200,
      message: "NEWS.FETCH_SUCCESS",
      data: response ? response.pickFields() : null,
    }).asJsonResponse(res);
  }

  @registerRoute(newsRoutes, "post", "", authenticate, adminOnly)
  static async createNews(req: Request, res: Response) {
    let data: TCreateNews = req.body;

    try {
      data = CreateNewsSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await NewsController.createNews(data);
    new AppResponse({
      code: 201,
      message: "NEWS.CREATE_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(newsRoutes, "put", ":id", authenticate, adminOnly)
  static async updateNews(req: Request, res: Response) {
    const { id } = req.params;
    let data: TUpdateNews = req.body;

    try {
      data = UpdateNewsSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await NewsController.updateNews(id, data);
    new AppResponse({
      code: 200,
      message: "NEWS.UPDATE_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(newsRoutes, "delete", ":id", authenticate, adminOnly)
  static async deleteNews(req: Request, res: Response) {
    const { id } = req.params;
    await NewsController.deleteNews(id);
    new AppResponse({
      code: 200,
      message: "NEWS.DELETE_SUCCESS",
      data: null,
    }).asJsonResponse(res);
  }
}
