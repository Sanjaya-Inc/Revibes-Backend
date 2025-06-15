import { RequestHandler } from "express";

export type TRouteDefinition = [
  method: "get" | "post" | "put" | "delete",
  path: string,
  ...handlers: RequestHandler[],
];
