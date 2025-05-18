import { Request, Response } from "express";
import firebase from "firebase-admin";
import AppResponse from "../utils/formatter/AppResponse";
import db from "../utils/db";
import COLLECTION_MAP from "../constant/db";
import User from "../models/User";

export const authenticate = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    res.status(401).send("Unauthorized");
    const err = new AppError("REQ_MISSING_TOKEN");
    new AppResponse({code: 401, err}).asJsonResponse(res);
    return;
  }
  try {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    
    // Load user from database using decodedToken.uid
    const userDoc = await db.collection(COLLECTION_MAP.USER).doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      const err = new AppError("USER_NOT_FOUND");
      new AppResponse({ code: 401, err }).asJsonResponse(res);
      return;
    }

    req.user = new User({ ...userDoc.data() });
    next(); // Proceed to the next handler
  } catch (error) {
    const err = new AppError("REQ_INVALID_TOKEN");
    new AppResponse({code: 401, err}).asJsonResponse(res);
  }
};
