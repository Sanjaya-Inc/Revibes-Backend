import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

const ACCESS_TOKEN_EXPIRES_IN = "30d"; // Example: 30 days
const REFRESH_TOKEN_EXPIRES_IN = "90d"; // Example: 90 days

export type TJwtPayload = {
  id: string;
  email: string;
  [key: string]: unknown; // Allow other custom claims
};

export type TJwtResult = [method: string, exp: Date];

export const generateAccessToken = (payload: TJwtPayload): TJwtResult => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
  const exp = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000); // 30 days
  return [token, exp];
};

export const generateRefreshToken = (payload: TJwtPayload): TJwtResult => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
  const exp = new Date(Date.now() + 60 * 60 * 24 * 90 * 1000); // 90 days
  return [token, exp];
};
