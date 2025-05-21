import express, { NextFunction, Request, Response } from 'express';
import ROUTES from './routes';
import { errorHandler } from '../../middlewares/error';

export const app = express();
app.use(express.json());

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

for (const [method, path, ...handlers] of ROUTES) {
  app[method](path, ...handlers.map(h => asyncHandler(h)));
}

app.use(errorHandler);

export default app;