import * as functions from "firebase-functions/v1";
import { REGION } from "../constant/region";

export const defaultRegion = functions.region(REGION);

export default defaultRegion;
