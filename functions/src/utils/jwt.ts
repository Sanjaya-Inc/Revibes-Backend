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
  phoneNumber?: string;
  [key: string]: unknown;
};

export type TJwtResult = [method: string, exp: Date];

// Helper function to decode the token and get the expiration
const getExpirationDateFromToken = (token: string): Date => {
  const decoded = jwt.decode(token) as TJwtPayload & { exp?: number };
  if (decoded && decoded.exp) {
    // 'exp' is typically in seconds since epoch, convert to milliseconds
    return new Date(decoded.exp * 1000);
  }
  throw new Error("Could not decode token or find expiration.");
};

export const generateAccessToken = (payload: TJwtPayload): TJwtResult => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
  const exp = getExpirationDateFromToken(token); // Get exp from the signed token
  return [token, exp];
};

export const generateRefreshToken = (payload: TJwtPayload): TJwtResult => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
  const exp = getExpirationDateFromToken(token); // Get exp from the signed token
  return [token, exp];
};
