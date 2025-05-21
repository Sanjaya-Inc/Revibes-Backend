import { onRequest } from 'firebase-functions/https';
import app from './server';
import "./routes";
import { setGlobalOptions } from "firebase-functions/v2";
import { REGION } from "../../constant/region";

// Set default region globally for all functions
setGlobalOptions({ region: REGION });

export const v1 = onRequest(app);