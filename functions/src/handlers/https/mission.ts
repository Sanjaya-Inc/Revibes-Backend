import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { parseFormData } from "../../utils/formatter/formData";
import { PaginationSchema, TPagination } from "../../dto/pagination";
import { getFileStorageInstance } from "../../utils/firebase";
import { MissionController } from "../../controllers/MissionController";
import {
  AddMissionSchema,
  AssignMissionSchema,
  DeleteMissionSchema,
  GetMissionSchema,
  TAddMission,
  TAssignMission,
  TDeleteMission,
  TGetMission,
} from "../../dto/mission";

export const missionRoutes = new Routes("missions");

export class MissionHandlers {
  @registerRoute(missionRoutes, "get", "", authenticate, adminOnly)
  static async getMissions(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let pagination: TPagination;
    try {
      pagination = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await MissionController.getMissions(pagination);

    await Promise.all(
      response.items.map(async (i) => {
        if (i.imageUri) {
          i.imageUri = await getFileStorageInstance().getFullUrl(i.imageUri);
        }

        i.getPublicFields();
        return i;
      }),
    );

    new AppResponse({
      code: 200,
      message: "MISSION.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(missionRoutes, "get", ":id", authenticate, adminOnly)
  static async getMission(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetMission = { id };
    try {
      // Validate form data using Zod
      data = GetMissionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await MissionController.getMission(data);
    if (!response) {
      throw new AppError(404, "MISSION.NOT_FOUND");
    }

    if (response.data.imageUri) {
      response.data.imageUri = await getFileStorageInstance().getFullUrl(
        response.data.imageUri,
      );
    }

    new AppResponse({
      code: 200,
      message: "MISSION.FETCH_SUCCESS",
      data: response.data.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(missionRoutes, "post", "", authenticate, adminOnly)
  static async createMission(req: Request, res: Response) {
    let data = parseFormData<TAddMission>(req);

    try {
      // Validate form data using Zod
      data = AddMissionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await MissionController.addMission(data);

    if (response.imageUri) {
      response.imageUri = await getFileStorageInstance().getFullUrl(
        response.imageUri,
      );
    }

    new AppResponse({
      code: 201,
      message: "MISSION.CREATE_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(missionRoutes, "post", ":id/assign", authenticate, adminOnly)
  static async assignMission(req: Request, res: Response) {
    const id = req.params.id;
    let data: TAssignMission = req.body;

    try {
      // Validate form data using Zod
      data = AssignMissionSchema.parse({ ...req.body, id });
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await MissionController.assignMissions(data);

    new AppResponse({
      code: 200,
      message: "MISSION.ASSIGNMENT_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(missionRoutes, "delete", ":id", authenticate, adminOnly)
  static async deleteMission(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TDeleteMission = { id };

    try {
      // Validate form data using Zod
      data = DeleteMissionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await MissionController.deleteMission(data);
    new AppResponse({
      code: 200,
      message: "MISSION.DELETE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
