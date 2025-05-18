import * as functions from "firebase-functions/v1";

import { User } from "../../controllers/User";

export const createUser = functions.auth.user().onCreate(async (user) => {
  console.log("triggered =========", user);
  
  const { uid, email, displayName, phoneNumber } = user;
  
  try {
    await User.createUser(uid, email, displayName, phoneNumber);  
    return null;
  } catch (error) {
    return null;
  }
});
