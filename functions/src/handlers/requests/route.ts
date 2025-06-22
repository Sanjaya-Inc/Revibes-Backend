import { RequestHandler } from "express";

export type method = "get" | "post" | "put" | "patch" | "delete";

export type RouteDefinition = [
  method: method,
  path: string,
  ...handlers: RequestHandler[],
];

export class Routes {
  public readonly group: string;
  private readonly subRoutes: RouteDefinition[];

  constructor(group: string) {
    this.group = group;
    this.subRoutes = [];
  }

  registerApi(method: method, path = "", ...handlers: RequestHandler[]) {
    path = path.startsWith("/") ? path.slice(1) : path;
    this.subRoutes.push([method, `/${this.group}/${path}`, ...handlers]);
  }

  getApis(): RouteDefinition[] {
    return this.subRoutes;
  }
}

export default Routes;
