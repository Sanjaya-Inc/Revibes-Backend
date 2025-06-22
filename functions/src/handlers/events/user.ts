// import * as functions from "firebase-functions/v1";
// import { db } from "../../utils/firebase";
// import COLLECTION_MAP from "../../constant/db";
// import { UserStatus } from "../../models/User";

// export const onEmailVerified = functions.auth.user().onCreate(async (user) => {
//   if (user.emailVerified) {
//     const userRef = db.collection(COLLECTION_MAP.USER).doc(user.uid);
//     await userRef.set(
//       {
//         status: UserStatus.VERIFIED,
//       },
//       { merge: true }
//     );
//   }

//   return null;
// });
