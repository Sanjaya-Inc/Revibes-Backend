import firebase from "firebase-admin";

function convertToClass<T>(
  targetClass: new (data: any) => T,
  id: string,
  data: any,
): T {
  // Convert Firestore Timestamp to JavaScript Date if necessary
  const lastClaimedDate = data.lastClaimedDate ?
    data.lastClaimedDate instanceof firebase.firestore.Timestamp ?
      data.lastClaimedDate.toDate() :
      data.lastClaimedDate :
    null;

  // Construct the object with the necessary data
  const obj = {
    ...data,
    uid: id,
    lastClaimedDate: lastClaimedDate,
  };

  return new targetClass(obj);
}

export default convertToClass;
