import express, { Request, Response, NextFunction } from "express";
import parseMultipartForm from "express-multipart-file-parser";

// --- Define your body parsing middleware instances ---
const jsonParser = express.json();
const urlencodedParser = express.urlencoded({ extended: true });
const multipartParser = parseMultipartForm; // Assign it for clarity (array of middleware)

export function bodyParser(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers["content-type"] as string | undefined;

  if (!contentType) {
    // No content-type header, likely a GET request or a POST without a body
    return next();
  }

  let idx = 0;
  function runNextMiddleware(err?: any) {
    if (err) return next(err);
    const middleware = (multipartParser as any[])[idx++];
    if (middleware) {
      middleware(req, res, runNextMiddleware);
    } else {
      next();
    }
  }

  if (contentType.startsWith("multipart/form-data")) {
    // If multipartParser is an array, call each middleware in sequence
    return runNextMiddleware();
  }

  if (contentType.startsWith("application/json")) {
    return jsonParser(req, res, next);
  }

  if (contentType.startsWith("application/x-www-form-urlencoded")) {
    return urlencodedParser(req, res, next);
  }

  // If content-type is something else (e.g., text/plain, application/xml),
  // or if it's missing, just move to the next middleware.
  // You might want to throw an error here if you only support specific types.
  console.log(
    `Unsupported Content-Type: ${contentType}. Skipping body parsing.`,
  );
  next();
}
