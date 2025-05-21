import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}


const ACCESS_TOKEN_EXPIRES_IN = "30m"; // Example: 30 minutes
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Example: 7 days

export type TJwtPayload = {
  uid: string;
  email: string;
  [key: string]: any; // Allow other custom claims
}

export type TJwtResult = [method: string, exp: Date];

export const generateAccessToken = (payload: TJwtPayload): TJwtResult => {
  const token = jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRES_IN});
  const exp = new Date(Date.now() + 60 * 30 * 1000); // 30 minutes
  return [token, exp];
};

export const generateRefreshToken = (payload: TJwtPayload): TJwtResult => {
  const token = jwt.sign(payload, JWT_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRES_IN});
  const exp = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); // 7 days
  return [token, exp];
};
