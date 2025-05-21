import { defaultRegion } from '../../utils/region';
import app from './server';
import "./routes";

export const v1 = defaultRegion.https.onRequest(app);