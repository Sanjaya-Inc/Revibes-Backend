import * as jwt from "jsonwebtoken";
import * as functions from "firebase-functions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

const ACCESS_TOKEN_EXPIRES_IN = "15m"; // Example: 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Example: 7 days

interface JWTPayload {
  uid: string;
  email: string;
  [key: string]: any; // Allow other custom claims
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRES_IN});
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRES_IN});
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    // Handle different JWT errors (e.g., expired, invalid signature)
    if (error.name === "TokenExpiredError") {
      throw new functions.https.HttpsError("unauthenticated", "Token expired");
    } else {
      throw new functions.https.HttpsError("unauthenticated", "Invalid token");
    }
  }
};
