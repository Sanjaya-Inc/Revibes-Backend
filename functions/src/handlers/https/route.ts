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
    const fullPath = path ? `/${this.group}/${path}` : `/${this.group}`;
    this.subRoutes.push([method, fullPath, ...handlers]);
  }

  getApis(): RouteDefinition[] {
    return this.subRoutes;
  }
}

export default Routes;
